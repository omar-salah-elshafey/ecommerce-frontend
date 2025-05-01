import { Component, inject, OnInit } from '@angular/core';
import { UserProfileService } from '../../core/services/userProfile/user-profile.service';
import { UpdateUserDto, UserDto } from '../../core/models/user';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../core/services/cart/cart.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MaritalStatus } from '../../core/models/auth';
import { PasswordService } from '../../core/services/password/password.service';

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
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmNewPassword = true;
  ngOnInit(): void {
    this.getCurrentUserProfile();
  }
  userProfile!: UserDto;
  loading = true;
  error: string | null = null;
  updateMode = false;
  changePasswordMode = false;
  updateProfileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private cookieService = inject(CookieService);
  private cartService = inject(CartService);
  private formBuilder = inject(FormBuilder);
  private passwordService = inject(PasswordService);

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

  maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

  initializeUpdateForm() {
    this.updateMode = true;
    this.updateProfileForm = this.formBuilder.group({
      firstName: [
        this.userProfile.firstName,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        this.userProfile.lastName,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      // maritalStatus: [
      //   this.translateMaritalStatus(this.userProfile.maritalStatus),
      //   Validators.required,
      // ],
      // hasChildren: [this.userProfile.hasChildren, Validators.required],
      // childrenCount: [this.userProfile.childrenCount, Validators.required],
    });

    // this.updateProfileForm
    //   .get('maritalStatus')
    //   ?.valueChanges.subscribe((value) => {
    //     this.handleMaritalStatusChange(value);
    //   });

    // this.updateProfileForm
    //   .get('hasChildren')
    //   ?.valueChanges.subscribe((value) => {
    //     this.handleHasChildrenChange(value);
    //   });
  }

  onUpdateProfile() {
    this.loading = true;
    if (this.updateProfileForm.invalid) {
      this.snackBar.open('يرجى تصحيح الأخطاء قبل الإرسال', 'إغلاق', {
        duration: 3000,
        direction: 'rtl',
        verticalPosition: 'top',
      });
      return;
    }
    const userData: UpdateUserDto = {
      firstName: this.updateProfileForm.value.firstName,
      lastName: this.updateProfileForm.value.lastName,
      // maritalStatus: this.getMaritalStatusEnum(
      //   this.updateProfileForm.value.maritalStatus
      // ),
      // hasChildren: this.updateProfileForm.value.hasChildren,
      // childrenCount: this.updateProfileForm.value.childrenCount,
    };
    this.userProfileService
      .updateProfile(this.userProfile.userName, userData)
      .subscribe({
        next: (response) => {
          this.userProfile = response;
          this.authService.updateCurrentUser(response);
          this.loading = false;
          this.updateMode = false;
          this.snackBar.open('تم تحديث البيانات بنجاح', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error!.error, 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
          console.error(error);
        },
      });
  }

  initializePasswordForm() {
    this.changePasswordMode = true;
    this.changePasswordForm = this.formBuilder.group(
      {
        email: [
          this.userProfile.email,
          [Validators.email, Validators.required],
        ],
        currentPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&^#])[A-Za-z\\d@$!%*?&^#]{8,}$'
            ),
          ],
        ],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&^#])[A-Za-z\\d@$!%*?&^#]{8,}$'
            ),
          ],
        ],
        confirmNewPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: AbstractControl): void | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;
    if (!form.get('confirmNewPassword')?.hasError('required')) {
      if (password !== confirmPassword) {
        form.get('confirmNewPassword')?.setErrors({ passwordMismatch: true });
      } else {
        form.get('confirmNewPassword')?.setErrors(null);
      }
    }
  }

  toggleOldPasswordVisibility(): void {
    this.hideOldPassword = !this.hideOldPassword;
  }
  toggleNewPasswordVisibility(): void {
    this.hideNewPassword = !this.hideNewPassword;
  }
  toggleConfirmNewPasswordVisibility(): void {
    this.hideConfirmNewPassword = !this.hideConfirmNewPassword;
  }

  onChangePassword() {
    this.loading = true;
    if (this.changePasswordForm.invalid) {
      this.snackBar.open('يرجى تصحيح الأخطاء قبل الإرسال', 'إغلاق', {
        duration: 3000,
        direction: 'rtl',
        verticalPosition: 'top',
      });
      return;
    }
    this.passwordService
      .changePassword(this.changePasswordForm.value)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.changePasswordMode = false;
          this.snackBar.open('تم تغيير كلمة المرور بنجاح', 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
          this.changePasswordForm.reset();
        },
        error: (error) => {
          this.loading = false;
          var message = error;
          console.log(message);
          this.snackBar.open(error.error!.error, 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
        },
      });
  }

  onCancel() {
    this.updateMode = false;
    this.changePasswordMode = false;
  }

  onDeleteAccount() {
    if (!confirm('هل أنت متأكد من حذف الحساب')) return;

    const userData = {
      userName: this.userProfile.userName,
      refreshToken: this.cookieService.get('refreshToken'),
    };
    this.userProfileService.deleteProfile(userData).subscribe({
      next: () => {
        this.authService.logout().subscribe();
        this.cartService.clearCart();
        this.router.navigate(['/home']);
        this.snackBar.open('تم حذف الملف الشخصي', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
    });
  }

  translateGender(gender: string): string {
    const translations: { [key: string]: string } = {
      Male: 'ذكر',
      Female: 'أنثى',
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

  private handleMaritalStatusChange(status: string) {
    const hasChildrenControl = this.updateProfileForm.get('hasChildren');
    const childrenCountControl = this.updateProfileForm.get('childrenCount');

    if (status === 'أعزب') {
      hasChildrenControl?.setValue(false);
      hasChildrenControl?.disable();
      childrenCountControl?.setValue(0);
      childrenCountControl?.disable();
    } else {
      hasChildrenControl?.enable();
      if (!this.updateProfileForm.value.hasChildren) {
        childrenCountControl?.setValue(1);
        childrenCountControl?.disable();
      }
    }
  }

  private handleHasChildrenChange(hasChildren: boolean) {
    const childrenCountControl = this.updateProfileForm.get('childrenCount');
    if (hasChildren) {
      childrenCountControl?.enable();
      childrenCountControl?.setValidators([
        Validators.required,
        Validators.min(1),
      ]);
    } else {
      childrenCountControl?.setValue(0);
      childrenCountControl?.disable();
      childrenCountControl?.clearValidators();
    }
    childrenCountControl?.updateValueAndValidity();
  }

  private getMaritalStatusEnum(value: string): MaritalStatus {
    switch (value) {
      case 'أعزب':
        return MaritalStatus.Single;
      case 'متزوج':
        return MaritalStatus.Married;
      case 'مطلق':
        return MaritalStatus.Divorced;
      case 'أرمل':
        return MaritalStatus.Widowed;
      default:
        return MaritalStatus.Single;
    }
  }
}
