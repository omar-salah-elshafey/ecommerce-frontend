import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
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
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductDto } from '../../core/models/product';
import { ProductService } from '../../core/services/product/product.service';

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
    MatIcon,
    MatTooltipModule,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [fadeIn],
})
export class ProductsComponent {
  private productService = inject(ProductService);
  products: ProductDto[] = [];
  currentPage = 1;
  pageSize = 12;
  isLoading = false;
  hasMore = true;
  private loadMore$ = new BehaviorSubject<void>(undefined);

  private loadProducts() {
    if (!this.hasMore || this.isLoading) return EMPTY;

    this.isLoading = true;
    return this.productService
      .getAllProducts(this.currentPage, this.pageSize)
      .pipe(
        tap((response) => {
          this.products = [...this.products, ...response.items];
          console.log(response);
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
    const threshold = 100;
    const position = window.scrollY + window.innerHeight;
    const height = document.documentElement.scrollHeight;

    if (position > height - threshold && this.hasMore) {
      this.loadMore$.next();
    }
  }

  wishlist: Set<number> = new Set();

  ngOnInit() {
    this.loadMore$
      .pipe(
        debounceTime(200),
        switchMap(() => this.loadProducts())
      )
      .subscribe();
    this.loadMore$.next();
  }

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
