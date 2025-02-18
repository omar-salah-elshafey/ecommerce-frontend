import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CartDto, CartItemChangeDto } from '../../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/api/Carts`;
  constructor(private http: HttpClient) {}

  getCart(): Observable<CartDto> {
    return this.http.get<CartDto>(`${this.apiUrl}/get-cart`);
  }

  addToCart(productDate: CartItemChangeDto): Observable<CartDto> {
    return this.http.post<CartDto>(`${this.apiUrl}/add-to-cart`, productDate);
  }

  removeFromCart(productId: string): Observable<CartDto> {
    return this.http.delete<CartDto>(
      `${this.apiUrl}/remove-from-cart/${productId}`,
      {}
    );
  }
}
