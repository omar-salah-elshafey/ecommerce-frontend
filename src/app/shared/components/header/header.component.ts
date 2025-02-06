import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { bounce, fadeIn } from '../../animations/animations';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeIn, bounce],
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  cartItemCount: number = 0;
  isLoggedIn: boolean = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful', response!);
      },
      error: (error) => {
        console.error('Logout failed:', error!);
      },
    });
  }

  @ViewChild('mobileNav', { read: ElementRef }) mobileNav!: ElementRef;
  @ViewChild('mobileMenuButton', { read: ElementRef })
  mobileMenuButton!: ElementRef;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isMenuOpen) {
      const target = event.target as HTMLElement;
      if (
        this.mobileNav &&
        !this.mobileNav.nativeElement.contains(target) &&
        this.mobileMenuButton &&
        !this.mobileMenuButton.nativeElement.contains(target)
      ) {
        this.isMenuOpen = false;
      }
    }
  }
}
