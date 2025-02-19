import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartDto, CartItemChangeDto } from '../../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/api/Carts`;
  private cartSubject = new BehaviorSubject<CartDto | null>(null);
  cart$ = this.cartSubject.asObservable();
  constructor(private http: HttpClient) {
    this.loadCart();
  }

  loadCart(): void {
    this.http
      .get<CartDto>(`${this.apiUrl}/get-cart`)
      .subscribe((cart) => this.cartSubject.next(cart));
  }

  getCart(): Observable<CartDto> {
    return this.http
      .get<CartDto>(`${this.apiUrl}/get-cart`)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  addToCart(productDate: CartItemChangeDto): Observable<CartDto> {
    return this.http
      .post<CartDto>(`${this.apiUrl}/add-to-cart`, productDate)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  removeFromCart(productId: string): Observable<CartDto> {
    return this.http
      .delete<CartDto>(`${this.apiUrl}/remove-from-cart/${productId}`, {})
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  clearCart(): void {
    this.cartSubject.next(null);
  }
}
