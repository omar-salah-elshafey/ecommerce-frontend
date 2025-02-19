import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdersService } from '../../../core/services/orders/orders.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CityDto, GovernorateDto } from '../../../core/models/order';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-place-order',
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.scss',
})
export class PlaceOrderComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private orderService = inject(OrdersService);
  private fb = inject(FormBuilder);
  checkoutForm!: FormGroup;
  governorates: GovernorateDto[] = [];
  cities: CityDto[] = [];
  selectedGovernorateId: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadGovernorates();
  }

  initializeForm(): void {
    this.checkoutForm = this.fb.group({
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?:\\+2)?(01(?:0|1|2|5)\\d{8})$'),
        ],
      ],
      governorateId: ['', Validators.required],
      cityId: ['', Validators.required],
      region: ['', Validators.required],
    });
  }

  loadGovernorates(): void {
    this.orderService.getGovernorates().subscribe((data) => {
      this.governorates = data;
    });
  }

  onGovernorateChange(governorateId: string): void {
    this.selectedGovernorateId = governorateId;
    this.checkoutForm.get('city')?.reset();
    this.cities = [];

    if (governorateId) {
      this.orderService.getCities(governorateId).subscribe((data) => {
        this.cities = data;
      });
    }
  }

  placeOrder(): void {
    this.isLoading = true;
    if (this.checkoutForm.invalid) {
      this.snackBar.open('يرجى تصحيح الأخطاء قبل الإرسال', 'إغلاق', {
        duration: 3000,
        direction: 'rtl',
        verticalPosition: 'top',
      });
      return;
    }
    this.orderService.placeOrder(this.checkoutForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('تم تقديم الطلب بنجاح', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          direction: 'rtl',
        });
        this.checkoutForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Order placement error:', error);
        this.snackBar.open('حدث خطأ أثناء تقديم الطلب', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          direction: 'rtl',
        });
      },
    });
  }
}
