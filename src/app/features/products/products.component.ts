import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { ProductsService } from '../../core/services/mock-data/products.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  BehaviorSubject,
  debounceTime,
  delay,
  distinctUntilChanged,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { Product } from '../../shared/models/product';
import { fadeIn } from '../../shared/animations/animations';

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
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [fadeIn],
})
export class ProductsComponent {
  private productsService = inject(ProductsService);
  loading = true;
  // Filter State
  filters = {
    category: '',
    minPrice: 0,
    maxPrice: 10000,
  };
  // Categories and products streams
  categories$ = this.productsService.getCategories();
  filteredProducts$!: Observable<Product[]>;

  ngOnInit() {
    this.productsService
      .getProducts()
      .pipe(
        delay(2000),
        tap(() => (this.loading = false))
      )
      .subscribe();
  }

  updateFilters() {
    this.filteredProducts$ = this.productsService.filterProducts(this.filters);
  }
}
