import { Component, inject, OnInit } from '@angular/core';
import { UserProfileService } from '../../core/services/userProfile/user-profile.service';
import { UserDto } from '../../core/models/user';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  ngOnInit(): void {
    this.getCurrentUserProfile();
  }
  userProfile!: UserDto;
  loading = true;
  error: string | null = null;
  private userProfileService = inject(UserProfileService);
  private snackBar = inject(MatSnackBar);
  getCurrentUserProfile() {
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('فشل تحميل بيانات الملف الشخصي', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        console.error('Error fetching user profile:', error);
      },
    });
  }

  translateGender(gender: string): string {
    const translations: { [key: string]: string } = {
      Male: 'ذكر',
      Female: 'أنثى',
      Unknown: 'غير محدد',
    };
    return translations[gender] || gender;
  }

  translateMaritalStatus(status: string): string {
    const translations: { [key: string]: string } = {
      Single: 'أعزب',
      Married: 'متزوج',
      Divorced: 'مطلق',
      Widowed: 'أرمل',
    };
    return translations[status] || status;
  }
}
