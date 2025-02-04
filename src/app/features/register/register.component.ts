import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@Component({
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
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  registerForm!: FormGroup;
  genders = ['ذكر', 'أنثى', 'غير محدد'];
  maritalStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        userName: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        gender: ['', Validators.required],
        maritalStatus: ['', Validators.required],
        hasChildren: [false],
        childrenCount: [0],
        password: ['', [Validators.required, Validators.minLength(8)]],
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

  private passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
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
        childrenCountControl?.setValue(0);
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

  onSubmit() {
    if (this.registerForm.valid) {
      // API call will be added here
      console.log(this.registerForm.value);
      this.snackBar.open('تم تسجيل الحساب بنجاح', 'إغلاق', {
        duration: 3000,
        direction: 'rtl',
      });
      this.router.navigate(['/login']);
    }
  }
}
