import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductDto } from '../../../core/models/product';
import { ProductService } from '../../../core/services/product/product.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-products',
  imports: [RouterModule, MatCardModule, CommonModule],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.scss',
})
export class ManageProductsComponent implements OnInit {
  products: ProductDto[] = [];

  constructor(private productService: ProductService) {}
  ngOnInit(): void {
    this.productService
      .getAllProducts(1, 20)
      .subscribe((res) => (this.products = res.items));
  }
}
