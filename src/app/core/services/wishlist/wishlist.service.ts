import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WishlistDto } from '../../models/wishlist';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly apiUrl = `${environment.apiUrl}/api/Wishlist`;
  constructor(private http: HttpClient) {}

  getWishlist(): Observable<WishlistDto> {
    return this.http.get<WishlistDto>(`${this.apiUrl}/get-wishlist`);
  }

  addToWishlist(productId: string): Observable<WishlistDto> {
    return this.http.post<WishlistDto>(
      `${this.apiUrl}/add-to-wishlist/${productId}`,
      {}
    );
  }

  removeFromWishlist(productId: string): Observable<WishlistDto> {
    return this.http.delete<WishlistDto>(
      `${this.apiUrl}/remove-wishlist-item/${productId}`,
      {}
    );
  }
}
