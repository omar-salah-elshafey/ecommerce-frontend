import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { bounce, fadeIn } from '../../animations/animations';
import { CommonModule } from '@angular/common';

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
export class HeaderComponent {
  isMenuOpen = false;
  cartItemCount: number = 0;

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
