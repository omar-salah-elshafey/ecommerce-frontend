import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth/auth.service';
import {
  Gender,
  MaritalStatus,
  RegistrationDto,
  Role,
} from '../../../core/models/auth';

@Component({
  selector: 'app-add-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  registerForm!: FormGroup;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading = false;
  errorMessage: string | null = null;

  genders = ['ذكر', 'أنثى'];
  maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
  roles = [
    { label: 'مستخدم', value: Role.User },
    { label: 'مسؤول', value: Role.Admin },
  ];

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
        role: ['', Validators.required],
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
      role: this.registerForm.value.role,
      gender: this.getGenderEnum(this.registerForm.value.gender),
      maritalStatus: this.getMaritalStatusEnum(
        this.registerForm.value.maritalStatus
      ),
    };

    this.authService.addUser(registrationData).subscribe({
      next: () => {
        this.snackBar.open('تم التسجيل بنجاح!.', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.isLoading = false;
        this.registerForm.reset();
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
        return Gender.Male;
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
