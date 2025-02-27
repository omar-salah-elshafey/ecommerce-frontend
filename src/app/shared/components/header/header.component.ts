import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { bounce, fadeIn } from '../../animations/animations';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { CartService } from '../../../core/services/cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    CommonModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeIn, bounce],
})
export class HeaderComponent implements OnInit {
  @ViewChild(MatMenuTrigger) profileMenuTrigger!: MatMenuTrigger;
  @ViewChild('mobileNav', { read: ElementRef }) mobileNav!: ElementRef;
  @ViewChild('mobileMenuButton', { read: ElementRef })
  mobileMenuButton!: ElementRef;

  isMenuOpen = false;
  cartItemCount: number = 0;
  authState$ = of({ loading: true });

  constructor(
    public authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authState$ = this.authService.isLoggedIn$.pipe(
      startWith(null),
      distinctUntilChanged(),
      switchMap((isLoggedIn) => {
        if (isLoggedIn === null) return of({ loading: true });
        return isLoggedIn
          ? this.authService.currentUser$.pipe(
              map((user) => ({ isLoggedIn: true, user, loading: false }))
            )
          : of({ isLoggedIn: false, user: null, loading: false });
      })
    );

    this.cartService.cart$.subscribe((cart) => {
      if (cart && cart.items) {
        this.cartItemCount = cart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      } else {
        this.cartItemCount = 0;
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.cartService.clearCart();
      },
      error: (error) => {
        console.error('Logout failed:', error!);
      },
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.isMenuOpen &&
      !this.mobileNav.nativeElement.contains(event.target) &&
      !this.mobileMenuButton.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }

  onWishlistClick(): void {
    if (this.authService.getAccessToken()) {
      this.router.navigate(['/wishlist']);
    } else {
      this.snackBar.open('يجب تسجيل الدخول أولاً', 'إغلاق', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }
}
