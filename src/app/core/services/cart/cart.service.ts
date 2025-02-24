import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { CartDto, CartItemChangeDto } from '../../models/cart';
import { AuthService } from '../auth/auth.service';
import { ProductService } from '../product/product.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/api/Carts`;
  private cartSubject = new BehaviorSubject<CartDto | null>(null);
  cart$ = this.cartSubject.asObservable();
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.loadCart();
  }

  private getLocalCart(): CartDto {
    const cartJson = localStorage.getItem('localCart');
    if (cartJson) {
      return JSON.parse(cartJson);
    }
    return { id: '', userId: '', items: [], totalCartPrice: 0 };
  }

  private setLocalCart(cart: CartDto): void {
    localStorage.setItem('localCart', JSON.stringify(cart));
  }

  loadCart(): void {
    this.http
      .get<CartDto>(`${this.apiUrl}/get-cart`)
      .subscribe((cart) => this.cartSubject.next(cart));
  }

  private getImageUrl(imageUrl: string): string {
    return `${environment.apiUrl}${imageUrl}`;
  }

  getCart(): Observable<CartDto> {
    if (!this.authService.getAccessToken()) {
      return of(this.getLocalCart());
    } else {
      return this.http.get<CartDto>(`${this.apiUrl}/get-cart`).pipe(
        tap((cart) => {
          cart.items.forEach((item) => {
            item.imageUrl = this.getImageUrl(item.imageUrl);
          });
          this.cartSubject.next(cart);
        })
      );
    }
  }

  // addToCart(item: CartItemChangeDto): Observable<CartDto> {
  //   if (!this.authService.getAccessToken()) {
  //     let localCart = this.getLocalCart();
  //     const existing = localCart.items.find(
  //       (i) => i.productId === item.productId
  //     );
  //     if (existing) {
  //     } else {
  //       localCart.items.push({
  //         id: '',
  //         productId: item.productId,
  //         name: '',
  //         imageUrl: '',
  //         quantity: 1,
  //         stock: 0,
  //         maxOrderQuantity: 0,
  //         productPrice: 0,
  //         totalPrice: 0,
  //       });
  //     }
  //     localCart.totalCartPrice = localCart.items.reduce(
  //       (sum, i) => sum + i.productPrice * i.quantity,
  //       0
  //     );
  //     this.setLocalCart(localCart);
  //     this.cartSubject.next(localCart);
  //     return of(localCart);
  //   } else {
  //     return this.http
  //       .post<CartDto>(`${this.apiUrl}/add-to-cart`, item)
  //       .pipe(tap((cart) => this.cartSubject.next(cart)));
  //   }
  // }

  addToCart(item: CartItemChangeDto): Observable<CartDto> {
    if (!this.authService.getAccessToken()) {
      return this.productService.getProductById(item.productId).pipe(
        switchMap((product) => {
          console.log('Product:', product);
          let localCart = this.getLocalCart();
          const existing = localCart.items.find(
            (i) => i.productId === item.productId
          );

          if (existing) {
            existing.quantity = item.quantity;
          } else {
            localCart.items.push({
              id: '',
              productId: product.id,
              name: product.name,
              imageUrl: product.mainImageUrl,
              quantity: item.quantity,
              stock: product.stock,
              maxOrderQuantity: product.maxOrderQuantity,
              productPrice: product.price,
              totalPrice: product.price * item.quantity,
            });
          }

          localCart.totalCartPrice = localCart.items.reduce(
            (sum, i) => sum + i.productPrice * i.quantity,
            0
          );

          this.setLocalCart(localCart);
          this.cartSubject.next(localCart);

          return of(localCart);
        })
      );
    } else {
      return this.http.post<CartDto>(`${this.apiUrl}/add-to-cart`, item).pipe(
        tap((cart) => {
          cart.items.forEach((item) => {
            item.imageUrl = this.getImageUrl(item.imageUrl);
          });
          this.cartSubject.next(cart);
        })
      );
    }
  }

  removeFromCart(productId: string): Observable<CartDto> {
    if (!this.authService.getAccessToken()) {
      let localCart = this.getLocalCart();
      localCart.items = localCart.items.filter(
        (item) => item.productId !== productId
      );
      localCart.totalCartPrice = localCart.items.reduce(
        (sum, i) => sum + i.productPrice * i.quantity,
        0
      );
      this.setLocalCart(localCart);
      this.cartSubject.next(localCart);
      return of(localCart);
    } else {
      return this.http
        .delete<CartDto>(`${this.apiUrl}/remove-from-cart/${productId}`, {})
        .pipe(
          tap((cart) => {
            cart.items.forEach((item) => {
              item.imageUrl = this.getImageUrl(item.imageUrl);
            });
            this.cartSubject.next(cart);
          })
        );
    }
  }

  clearCart(): void {
    if (!this.authService.getAccessToken()) {
      localStorage.removeItem('localCart');
    }
    this.cartSubject.next(null);
  }

  mergeLocalCart(): Observable<CartDto> {
    const localCart = this.getLocalCart();
    if (!localCart.items.length) {
      return of(localCart);
    }
    return localCart.items
      .reduce((obs, item) => {
        return obs.pipe(
          switchMap(() =>
            this.addToCart({
              productId: item.productId,
              quantity: item.quantity,
            })
          )
        );
      }, of(localCart))
      .pipe(
        tap(() => {
          localStorage.removeItem('localCart');
        }),
        switchMap(() => this.getCart())
      );
  }
}
