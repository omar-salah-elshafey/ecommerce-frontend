import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from '../../core/services/mock-data/products.service';
import { Product } from '../../shared/models/product';
import { Observable, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-product-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
})
export class ProductDetailsComponent {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);

  product$!: Observable<Product | undefined>;

  ngOnInit() {
    this.product$ = this.route.params.pipe(
      switchMap((params) => this.productsService.getProductById(+params['id']))
    );
  }
}
