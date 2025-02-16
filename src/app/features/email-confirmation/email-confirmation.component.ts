import { Component, OnInit } from '@angular/core';
import { EmailService } from '../../core/services/email/email.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-email-confirmation',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './email-confirmation.component.html',
  styleUrl: './email-confirmation.component.scss',
})
export class EmailConfirmationComponent implements OnInit {
  confirmEmailForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  showResendLink = false;
  userEmail: string | null = null;
  constructor(
    private formBuilder: FormBuilder,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.confirmEmailForm = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.email]],
      Token: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.confirmEmailForm.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = null;
    this.showResendLink = false;

    const trimmedValues = {
      Email: this.confirmEmailForm.get('Email')?.value.trim(),
      Token: this.confirmEmailForm.get('Token')?.value.trim(),
    };

    this.emailService.confirmEmail(trimmedValues).subscribe({
      next: (response) => {
        console.log(response);
        this.snackBar.open('تم تفعيل الحساب بنجاح', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.loading = false;
        this.snackBar.open(error.error!.error, 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.showResendLink = true;
      },
    });
  }

  resendConfirmationEmail() {
    console.log('From Resend.');
    const email = this.confirmEmailForm.get('Email')?.value;
    console.log(email);
    if (!email) return;

    this.loading = true;
    this.errorMessage = null;

    this.emailService.resendConfirmationEmail(email).subscribe({
      next: (response) => {
        console.log(response);
        this.snackBar.open('تم إعادة إرسال رمز التفعيل', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.loading = false;
        this.errorMessage = 'فشل إعادة الإرسال، يرجى المحاولة لاحقًا';
      },
    });
  }

}
