import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../../core/services/cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CartDto,
  CartItemChangeDto,
  CartItemsDto,
} from '../../core/models/cart';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cart!: CartDto;
  cartItems: CartItemsDto[] = [];
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  isLoading = false;
  totalPrice = 0;
  isLoggedIn = this.authService.getAccessToken() !== null;

  ngOnInit(): void {
    this.loadCart();
    if (this.authService.getAccessToken()) this.loadWishlist();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cart = response;
        this.cartItems = response.items;
        this.totalPrice = response.totalCartPrice;
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  removeFromCart(productId: string) {
    if (!confirm('هل أنت متأكد من حذف العنصر من السلة')) return;

    this.isLoading = true;
    this.cartService.removeFromCart(productId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cartItems = response.items;
        console.log('After Deletion: ', response);
        this.snackBar.open('تم حذف العنصر', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting Item:', error);
        this.snackBar.open('حدث خطأ أثناء حذف العنصر', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }

  addToCart(item: CartItemChangeDto) {
    this.isLoading = true;
    this.cartService.addToCart(item).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cartItems = response.items;
        this.totalPrice = response.totalCartPrice;
        this.snackBar.open('تم تحديث العنصر', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting Item:', error);
        this.snackBar.open('حدث خطأ أثناء تحديث العنصر', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }

  increaseQuantity(item: CartItemsDto) {
    if (!this.authService.getAccessToken()) {
      this.snackBar.open('يجب تسجيل الدخول أولاً', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    if (item.quantity < item.maxOrderQuantity) {
      item.quantity++;
      this.addToCart(item);
    }
  }

  decreaseQuantity(item: CartItemsDto) {
    if (!this.authService.getAccessToken()) {
      this.snackBar.open('يجب تسجيل الدخول أولاً', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    if (item.quantity > 1) {
      item.quantity--;
      this.addToCart(item);
    } else if (item.quantity == 1) {
      this.removeFromCart(item.productId);
    }
  }

  wishlistItems: string[] = [];

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.wishlistItems = response.items.map((item) => item.productId);
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
      },
    });
  }

  onWishlistClick(productId: string): void {
    if (this.authService.getAccessToken()) {
      this.toggleWishlist(productId);
    } else {
      this.snackBar.open('يجب تسجيل الدخول أولاً', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  toggleWishlist(productId: string) {
    if (this.isInWishlist(productId)) {
      this.wishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.wishlistItems = this.wishlistItems.filter(
            (id) => id !== productId
          );
          this.snackBar.open('تمت إزالة المنتج من المفضلة', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
          this.snackBar.open('حدث خطأ أثناء إزالة المنتج من المفضلة', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
        },
      });
    } else {
      this.wishlistService.addToWishlist(productId).subscribe({
        next: () => {
          this.wishlistItems.push(productId);
          this.snackBar.open('تمت إضافة المنتج للمفضلة', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.snackBar.open('حدث خطأ أثناء إضافة المنتج للمفضلة', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
        },
      });
    }
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems.includes(productId);
  }
}
