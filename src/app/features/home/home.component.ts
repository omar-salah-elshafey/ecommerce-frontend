import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { catchError, Observable, of, tap } from 'rxjs';
import { NewsLetterService } from '../../core/services/news-letter/news-letter.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

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
    MatProgressSpinnerModule,
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
  isMobile = window.innerWidth <= 768;
  @ViewChild('featuredSwiper') featuredSwiperRef!: ElementRef;
  @ViewChild('bestSellersSwiper') bestSellersSwiperRef!: ElementRef;
  email = '';

  private initSwiper(ref: ElementRef) {
    return new Swiper(ref.nativeElement, {
      modules: [Navigation, Pagination, Autoplay],
      slidesPerView: 1,
      spaceBetween: 16,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      loop: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        400: { slidesPerView: 2 },
        480: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        900: { slidesPerView: 5 },
      },
    });
  }

  private loadFeaturedProducts() {
    this.featuredProducts$ = this.productService
      .getFeaturedProducts(1, 12)
      .pipe(
        tap(() => {
          setTimeout(() => {
            if (this.featuredSwiperRef) {
              this.initSwiper(this.featuredSwiperRef);
            }
          }, 0);
        }),
        catchError((error) => {
          this.matSnackBar.open('خطأ في تحميل المنتجات المميزة', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
          console.error('Error loading featured products:', error);
          return of([]);
        })
      );
  }

  private loadBestSellers() {
    this.bestSellers$ = this.productService.getBestSellers().pipe(
      tap(() => {
        setTimeout(() => {
          if (this.bestSellersSwiperRef) {
            this.initSwiper(this.bestSellersSwiperRef);
          }
        }, 0);
      }),
      catchError((error) => {
        this.matSnackBar.open('خطأ في تحميل المنتجات الأكثر مبيعًا', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        console.error('Error loading best sellers:', error);
        return of([]);
      })
    );
  }

  ngAfterViewInit() {
    // Swiper initialization is handled in loadFeaturedProducts and loadBestSellers
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
