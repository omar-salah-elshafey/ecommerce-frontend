import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth/auth.service';
import {
  Gender,
  MaritalStatus,
  RegistrationDto,
  Role,
} from '../../core/models/auth';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private authService = inject(AuthService);
  constructor() {}

  registerForm!: FormGroup;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading = false;
  errorMessage: string | null = null;

  genders = ['ذكر', 'أنثى', 'غير محدد'];
  maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        ],
        userName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?:\\+2)?(01(?:0|1|2|5)\\d{8})$'),
          ],
        ],
        gender: ['', Validators.required],
        maritalStatus: ['', Validators.required],
        hasChildren: [false],
        childrenCount: [1],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.registerForm.get('maritalStatus')?.valueChanges.subscribe((value) => {
      this.handleMaritalStatusChange(value);
    });

    this.registerForm.get('hasChildren')?.valueChanges.subscribe((value) => {
      this.handleHasChildrenChange(value);
    });
  }

  onSubmit() {
    this.isLoading = true;
    if (this.registerForm.invalid) {
      this.snackBar.open('يرجى تصحيح الأخطاء قبل الإرسال', 'إغلاق', {
        duration: 3000,
        direction: 'rtl',
        verticalPosition: 'top',
      });
      return;
    }

    const registrationData: RegistrationDto = {
      ...this.registerForm.value,
      role: Role.User, // Default role
      gender: this.getGenderEnum(this.registerForm.value.gender),
      maritalStatus: this.getMaritalStatusEnum(
        this.registerForm.value.maritalStatus
      ),
    };

    this.authService.registerUser(registrationData).subscribe({
      next: () => {
        this.snackBar.open(
          'تم التسجيل بنجاح! يرجى تفعيل حسابك باستخدام الكود المرسل لبريدك الإلكتروني.',
          'إغلاق',
          {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          }
        );
        this.isLoading = false;
        this.router.navigate(['/confirm-email']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.snackBar.open(error.error!.error, 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  passwordMatchValidator(form: AbstractControl): void | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (!form.get('confirmPassword')?.hasError('required')) {
      if (password !== confirmPassword) {
        form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      } else {
        form.get('confirmPassword')?.setErrors(null);
      }
    }
  }

  private handleMaritalStatusChange(status: string) {
    const hasChildrenControl = this.registerForm.get('hasChildren');
    const childrenCountControl = this.registerForm.get('childrenCount');

    if (status === 'أعزب') {
      hasChildrenControl?.setValue(false);
      hasChildrenControl?.disable();
      childrenCountControl?.setValue(0);
      childrenCountControl?.disable();
    } else {
      hasChildrenControl?.enable();
      if (!this.registerForm.value.hasChildren) {
        childrenCountControl?.setValue(1);
        childrenCountControl?.disable();
      }
    }
  }

  private handleHasChildrenChange(hasChildren: boolean) {
    const childrenCountControl = this.registerForm.get('childrenCount');
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

  private getGenderEnum(value: string): Gender {
    switch (value) {
      case 'ذكر':
        return Gender.Male;
      case 'أنثى':
        return Gender.Female;
      default:
        return Gender.Unknown;
    }
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
