import { Component, inject, OnInit } from '@angular/core';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { WishlistItemDto } from '../../core/models/wishlist';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../../core/services/cart/cart.service';
import { CartItemChangeDto } from '../../core/models/cart';

@Component({
  selector: 'app-wishlist',
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
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  wishlistItems: WishlistItemDto[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist() {
    this.isLoading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.wishlistItems = response.items;
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  removeFromWishlist(reviewId: string) {
    if (!confirm('هل أنت متأكد من حذف العنصر من المفضلة')) return;

    this.isLoading = true;
    this.wishlistService.removeFromWishlist(reviewId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.wishlistItems = response.items;
        this.snackBar.open('تم حذف العنصر', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting item:', error);
        this.snackBar.open('حدث خطأ أثناء حذف العنصر', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }

  addToCart(productId: string) {
    const item: CartItemChangeDto = {
      productId: productId,
      quantity: 1,
    };
    this.cartService.addToCart(item).subscribe({
      next: () => {
        this.snackBar.open('تمت إضافة المنتج للسلة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        this.snackBar.open('حدث خطأ أثناء إضافة المنتج للسلة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }
}
