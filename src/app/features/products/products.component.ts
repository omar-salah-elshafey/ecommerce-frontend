import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  EMPTY,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { fadeIn } from '../../shared/animations/animations';
import { RouterModule } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductDto } from '../../core/models/product';
import { ProductService } from '../../core/services/product/product.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { CartService } from '../../core/services/cart/cart.service';
import { CartItemChangeDto } from '../../core/models/cart';
import { CategoryService } from '../../core/services/category/category.service';
import { CategoryDto } from '../../core/models/category';
import { CategoryTreeComponent } from './category-tree/category-tree.component';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatSliderModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    MatTreeModule,
    CategoryTreeComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [fadeIn],
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  products: ProductDto[] = [];
  currentPage = 1;
  pageSize = 20;
  isLoading = false;
  hasMore = true;
  private loadMore$ = new BehaviorSubject<void>(undefined);
  categories: CategoryDto[] = [];
  selectedCategoryIds: string[] = [];
  searchQuery: string = '';

  private loadProducts() {
    if (!this.hasMore || this.isLoading) return EMPTY;

    this.isLoading = true;
    return this.productService
      .getAllProducts(this.currentPage, this.pageSize)
      .pipe(
        tap((response) => {
          this.products = [...this.products, ...response.items];
          this.currentPage++;
          const totalPages = Math.ceil(response.totalItems / response.pageSize);
          this.hasMore = this.currentPage <= totalPages;
          this.isLoading = false;
        }),
        catchError((error) => {
          this.isLoading = false;
          console.error('Error loading products:', error);
          return throwError(() => error);
        })
      );
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 100 && this.hasMore) {
      this.loadMore$.next();
    }
  }

  wishlist: Set<number> = new Set();

  ngOnInit() {
    const savedFilters = sessionStorage.getItem('selectedCategoryIds');
    if (savedFilters) {
      this.selectedCategoryIds = JSON.parse(savedFilters);
      // Reset product list and pagination state, then load filtered products
      this.products = [];
      this.currentPage = 1;
      this.hasMore = true;
      this.loadProductsByFilter();
    } else {
      // No saved filters: load all products using infinite scroll logic
      this.loadMore$
        .pipe(
          debounceTime(200),
          switchMap(() => this.loadProducts())
        )
        .subscribe();
      this.loadMore$.next();
    }
    if (this.authService.getAccessToken()) this.loadWishlist();
    this.getcategoties();
  }

  getcategoties() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadProductsByFilter() {
    this.isLoading = true;
    let productObservable;
    if (this.selectedCategoryIds.length > 0) {
      productObservable = this.productService.getProductsByCategoryIds(
        this.selectedCategoryIds,
        this.currentPage,
        this.pageSize
      );
    } else {
      productObservable = this.productService.getAllProducts(
        this.currentPage,
        this.pageSize
      );
    }
    productObservable
      .pipe(
        tap((response) => {
          // Reset or append products based on your UX (here we append)
          this.products = [...this.products, ...response.items];
          this.currentPage++;
          const totalPages = Math.ceil(response.totalItems / response.pageSize);
          this.hasMore = this.currentPage <= totalPages;
          this.isLoading = false;
        }),
        catchError((error) => {
          this.isLoading = false;
          console.error('Error loading filtered products:', error);
          return throwError(() => error);
        })
      )
      .subscribe();
  }

  onCategoryCheckboxChange(categoryId: string, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedCategoryIds.includes(categoryId)) {
        this.selectedCategoryIds.push(categoryId);
      }
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(
        (id) => id !== categoryId
      );
    }
    sessionStorage.setItem(
      'selectedCategoryIds',
      JSON.stringify(this.selectedCategoryIds)
    );
    // Reset products and pagination when filters change
    this.products = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.loadProductsByFilter();
  }

  searchProducts(query: string) {
    this.products = [];
    this.currentPage = 1;
    this.hasMore = true;

    if (query.trim() !== '') {
      this.isLoading = true;
      this.productService
        .searchProducts(query, this.currentPage, this.pageSize)
        .pipe(
          tap((response) => {
            this.products = response.items;
            this.currentPage++;
            const totalPages = Math.ceil(
              response.totalItems / response.pageSize
            );
            this.hasMore = this.currentPage <= totalPages;
            this.isLoading = false;
          }),
          catchError((error) => {
            this.isLoading = false;
            console.error('Error searching products:', error);
            return throwError(() => error);
          })
        )
        .subscribe();
    } else {
      this.loadMore$.next();
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
        console.error('Error adding to Cart:', error);
        this.snackBar.open('حدث خطأ أثناء إضافة المنتج للسلة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }
}
