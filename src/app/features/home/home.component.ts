import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  fadeIn,
  slideIn,
  staggerAnimation,
} from '../../shared/animations/animations';
import { ProductDto } from '../../core/models/product';
import { ProductService } from '../../core/services/product/product.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { Observable } from 'rxjs';
import { NewsLetterService } from '../../core/services/news-letter/news-letter.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatSliderModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeIn, slideIn, staggerAnimation],
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private newsLetterService = inject(NewsLetterService);
  private matSnackBar = inject(MatSnackBar);
  featuredProducts$!: Observable<ProductDto[]>;
  bestSellers$!: Observable<ProductDto[]>;
  email = '';
  private loadFeaturedProducts() {
    this.featuredProducts$ = this.productService.getFeaturedProducts(1, 8);
  }

  private loadBestSellers() {
    this.bestSellers$ = this.productService.getBestSellers();
  }

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadBestSellers();
  }

  newsLetterSubscribe(email: string) {
    this.newsLetterService.subscribe(email).subscribe({
      next: () => {
        this.email = '';
        this.matSnackBar.open('تم الاشتراك بنجاح', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
      error: (error) => {
        this.matSnackBar.open(error.error!.error, 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
    });
  }
}
