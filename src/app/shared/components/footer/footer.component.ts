import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NewsLetterService } from '../../../core/services/news-letter/news-letter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private newsLetterService = inject(NewsLetterService);
  private matSnackBar = inject(MatSnackBar);
  currentYear = new Date().getFullYear();
  email = '';
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
