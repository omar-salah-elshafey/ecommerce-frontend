import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data/mock-data.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { fadeIn, slideIn, staggerAnimation } from '../../shared/animations/animations';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    RouterLink,
    CommonModule,
    AsyncPipe,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss',],
  animations: [fadeIn, slideIn, staggerAnimation],
})
export class HomeComponent {
  private mockDataService = inject(MockDataService);

  categories = this.mockDataService.getCategories();
  featuredProducts = this.mockDataService.getFeaturedProducts();
}
