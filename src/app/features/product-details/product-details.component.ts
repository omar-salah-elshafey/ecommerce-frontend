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
import { ProductDto } from '../../core/models/product';
import { ProductService } from '../../core/services/product/product.service';

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
  product!: ProductDto;
  selectedImage!: string;
  loading = true;
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe((product) => {
        this.product = product;
        this.selectedImage = product.mainImageUrl;
        this.loading = false;
      });
    }
  }

  selectImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }
}
