import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { PasswordService } from '../../../core/services/password/password.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-reset-password-request',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './reset-password-request.component.html',
  styleUrl: './reset-password-request.component.scss',
})
export class ResetPasswordRequestComponent implements OnInit {
  resetPasswordRequestForm!: FormGroup;
  tokenSent: boolean = false;
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private passwordService: PasswordService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.resetPasswordRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
    });
  }

  onSendToken() {
    this.isLoading = true;
    this.passwordService
      .resetPasswordRequest(this.resetPasswordRequestForm.value.email.trim())
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.tokenSent = true;
          console.log('Token sent to your email', response!);
          this.snackBar.open(
            'تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني',
            'إغلاق',
            {
              duration: 5000,
              direction: 'rtl',
              verticalPosition: 'top',
            }
          );
        },
        error: (err) => {
          console.error('Error sending token', err);
          this.isLoading = false;
          this.snackBar.open(err.error!.error, 'إغلاق', {
            duration: 3000,
            direction: 'rtl',
            verticalPosition: 'top',
          });
        },
      });
  }

  onSubmit() {
    if (this.resetPasswordRequestForm.invalid) {
      this.snackBar.open('يرجى تصحيح الأخطاء قبل الإرسال', 'إغلاق', {
        duration: 3000,
        direction: 'rtl',
        verticalPosition: 'top',
      });
      return;
    }
    this.isLoading = true;
    const userData = {
      email: this.resetPasswordRequestForm.value.email,
      token: this.resetPasswordRequestForm.value.token,
    };
    this.passwordService.verifyResetPasswordToken(userData).subscribe({
      next: () => {
        sessionStorage.setItem(
          'resetEmail',
          this.resetPasswordRequestForm.value.email
        );
        sessionStorage.setItem(
          'resetToken',
          this.resetPasswordRequestForm.value.token
        );
        console.log('Token verified successfully');
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.snackBar.open(err.error!.error, 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        console.error('Token verification failed', err.error!.error);
        this.isLoading = false;
      },
    });
  }
}
