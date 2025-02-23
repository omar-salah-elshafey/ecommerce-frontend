import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ContactUsService } from '../../core/services/contact-us/contact-us.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SendMessageDto } from '../../core/models/contact-us';

@Component({
  selector: 'app-contact-us',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
})
export class ContactUsComponent {
  contactForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required]),
  });
  isLoading = false;

  constructor(
    private contactService: ContactUsService,
    private snackBar: MatSnackBar
  ) {}

  submitForm() {
    if (this.contactForm.invalid) return;

    this.isLoading = true;
    const formValue = this.contactForm.value;

    const messageDto: SendMessageDto = {
      fullName: formValue.fullName!,
      email: formValue.email!,
      message: formValue.message!,
    };

    this.contactService.sendMessage(messageDto).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('تم إرسال الرسالة بنجاح', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.contactForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error sending message:', error);
        this.snackBar.open('حدث خطأ أثناء إرسال الرسالة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }
}
