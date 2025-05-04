import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductDto } from '../../core/models/product';
import { ProductService } from '../../core/services/product/product.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CreateReviewDto,
  ReviewDto,
  UpdateReviewDto,
} from '../../core/models/review';
import { ReviewsService } from '../../core/services/reviews/reviews.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../core/services/auth/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { CartService } from '../../core/services/cart/cart.service';
import { CartItemChangeDto } from '../../core/models/cart';

@Component({
  selector: 'app-product-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatTabsModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent {
  product!: ProductDto;
  selectedImage!: string;
  loading = true;
  quantity: number = 1;

  reviews: ReviewDto[] = [];
  currentReviewPage = 1;
  reviewPageSize = 5;
  totalReviews = 0;
  hasMoreReviews = true;
  averageRating = 0;
  reviewForm!: FormGroup;
  isSubmitting = false;
  selectedRating = 0;
  hoverRating = 0;

  editingReview: ReviewDto | null = null;

  private reviewsService = inject(ReviewsService);
  private fb = inject(FormBuilder);

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  public authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe({
        next: (product) => {
          this.product = product;
          this.selectedImage = product.mainImageUrl;
          this.loadReviews();
          this.initializeReviewForm();
          this.loading = false;
          if (this.authService.getAccessToken()) this.loadWishlist();
        },
        error: (err) => {
          console.error('Failed to load product:', err);
          this.loading = false;
          this.router.navigate(['/not-found']);
        },
      });
    }
  }

  selectImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }
  onSlideChange(index: number) {
    this.selectedImage = this.product.images[index].imageUrl;
  }

  increaseQuantity() {
    if (this.quantity < this.product.maxOrderQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  loadReviews() {
    if (!this.hasMoreReviews) return;

    this.reviewsService
      .getReviewsByProduct(
        this.product.id,
        this.currentReviewPage,
        this.reviewPageSize
      )
      .subscribe({
        next: (response) => {
          this.reviews = [...this.reviews, ...response.items];
          this.totalReviews = response.totalItems;
          this.currentReviewPage++;
          this.hasMoreReviews =
            this.currentReviewPage <=
            Math.ceil(response.totalItems / this.reviewPageSize);
          this.calculateAverageRating();
        },
        error: (err) => console.error('Error loading reviews:', err),
      });
  }

  calculateAverageRating() {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = total / this.reviews.length;
  }

  private initializeReviewForm() {
    this.reviewForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(10)]],
      rating: [0, [Validators.required, Validators.min(1)]],
    });
  }

  setRating(rating: number) {
    this.selectedRating = rating;
    this.hoverRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  submitReview() {
    if (this.reviewForm.invalid) return;

    this.isSubmitting = true;

    if (this.editingReview) {
      const reviewData: UpdateReviewDto = {
        ...this.reviewForm.value,
      };
      this.reviewsService
        .updateReview(this.editingReview.id, reviewData)
        .subscribe({
          next: (updatedReview) => {
            const index = this.reviews.findIndex(
              (r) => r.id === this.editingReview!.id
            );
            if (index !== -1) {
              this.reviews[index] = updatedReview;
            }
            this.calculateAverageRating();
            this.reviewForm.reset();
            this.selectedRating = 0;
            this.hoverRating = 0;
            this.editingReview = null;
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating review:', error);
            this.snackBar.open('حدث خطأ أثناء تعديل التقييم', 'إغلاق', {
              duration: 3000,
              direction: 'rtl',
              verticalPosition: 'top',
            });
            this.isSubmitting = false;
          },
        });
    } else {
      const reviewData: CreateReviewDto = {
        ...this.reviewForm.value,
        productId: this.product.id,
      };
      this.reviewsService.addReview(reviewData).subscribe({
        next: (newReview) => {
          this.reviews = [newReview, ...this.reviews];
          this.calculateAverageRating();
          this.reviewForm.reset();
          this.selectedRating = 0;
          this.hoverRating = 0;
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          this.snackBar.open('لقد قمت بتقييم هذا المنتج بالفعل', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
          this.reviewForm.reset();
          this.selectedRating = 0;
          this.hoverRating = 0;
          this.isSubmitting = false;
        },
      });
    }
  }

  deleteReview(review: ReviewDto) {
    if (!confirm('هل أنت متأكد من حذف التقييم؟')) return;

    this.reviewsService.deleteReview(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((r) => r.id !== review.id);
        this.calculateAverageRating();
        this.snackBar.open('تم حذف التقييم', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.snackBar.open('حدث خطأ أثناء حذف التقييم', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, index) => index < rating);
  }

  getStarIcons(rating: number): string[] {
    const starIcons: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        starIcons.push('star');
      } else if (rating >= i - 0.5) {
        starIcons.push('star_half');
      } else {
        starIcons.push('star_outline');
      }
    }
    return starIcons;
  }

  editReview(review: ReviewDto) {
    this.editingReview = review;
    // Patch form with review values:
    this.reviewForm.patchValue({
      comment: review.comment,
      rating: review.rating,
    });
    this.selectedRating = review.rating;
    this.hoverRating = review.rating;
  }

  cancelEditReview() {
    this.editingReview = null;
    this.reviewForm.reset();
    this.selectedRating = 0;
    this.hoverRating = 0;
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

  onWishlistClick(product: ProductDto): void {
    if (this.authService.getAccessToken()) {
      this.toggleWishlist(product);
    } else {
      this.snackBar.open('يجب تسجيل الدخول أولاً', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  toggleWishlist(product: ProductDto) {
    if (this.isInWishlist(product)) {
      this.wishlistService.removeFromWishlist(product.id).subscribe({
        next: () => {
          this.wishlistItems = this.wishlistItems.filter(
            (id) => id !== product.id
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
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: () => {
          this.wishlistItems.push(product.id);
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

  isInWishlist(product: ProductDto): boolean {
    return this.wishlistItems.includes(product.id);
  }

  addToCart(product: ProductDto) {
    const item: CartItemChangeDto = {
      productId: product.id,
      quantity: this.quantity,
    };
    this.cartService.addToCart(item).subscribe({
      next: () => {
        this.snackBar.open('تمت إضافة المنتج للسلة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.quantity = 1;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.snackBar.open('حدث خطأ أثناء إضافة المنتج للسلة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }
}
