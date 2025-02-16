import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe((product) => {
        this.product = product;
        this.selectedImage = product.mainImageUrl;
        this.loading = false;
        this.loadReviews();
        this.initializeReviewForm();
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

  wishlist: Set<number> = new Set();
  toggleWishlist(product: any) {
    if (this.wishlist.has(product.id)) {
      this.wishlist.delete(product.id);
    } else {
      this.wishlist.add(product.id);
    }
  }

  isInWishlist(product: any): boolean {
    return this.wishlist.has(product.id);
  }
}
