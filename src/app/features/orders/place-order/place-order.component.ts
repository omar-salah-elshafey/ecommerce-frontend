import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdersService } from '../../../core/services/orders/orders.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AddressDto,
  CityDto,
  CreateOrderDto,
  GovernorateDto,
} from '../../../core/models/order';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart/cart.service';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

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
    MatIconModule,
    FormsModule,
    MatRadioModule,
  ],
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.scss',
})
export class PlaceOrderComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private orderService = inject(OrdersService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  checkoutForm!: FormGroup;
  governorates: GovernorateDto[] = [];
  cities: CityDto[] = [];
  selectedGovernorateId: string | null = null;
  isLoading = false;
  addresses: AddressDto[] = [];
  selectedAddressId?: string;
  useExistingAddress = false;

  ngOnInit(): void {
    this.initializeForm();
    this.loadGovernorates();
    this.loadUserAddresses();
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

  private loadUserAddresses() {
    this.orderService.getUserAddresses().subscribe({
      next: (addresses) => (this.addresses = addresses),
      error: (err) => console.error('Failed to load addresses', err),
    });
  }

  toggleAddressType() {
    this.useExistingAddress = !this.useExistingAddress;
    this.checkoutForm.reset();

    if (this.useExistingAddress) {
      this.checkoutForm.get('governorateId')?.clearValidators();
      this.checkoutForm.get('cityId')?.clearValidators();
      this.checkoutForm.get('region')?.clearValidators();
    } else {
      this.checkoutForm
        .get('governorateId')
        ?.setValidators([Validators.required]);
      this.checkoutForm.get('cityId')?.setValidators([Validators.required]);
      this.checkoutForm.get('region')?.setValidators([Validators.required]);
    }

    this.checkoutForm.get('governorateId')?.updateValueAndValidity();
    this.checkoutForm.get('cityId')?.updateValueAndValidity();
    this.checkoutForm.get('region')?.updateValueAndValidity();

    if (!this.useExistingAddress) {
      this.selectedAddressId = undefined;
    }
  }

  onAddressSelect(addressId: string) {
    this.selectedAddressId = addressId;
  }

  loadGovernorates(): void {
    this.orderService.getGovernorates().subscribe((data) => {
      this.governorates = data;
    });
  }

  onGovernorateChange(governorateId: string): void {
    this.selectedGovernorateId = governorateId;
    this.checkoutForm.get('cityId')?.reset();
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
      console.error('Invalid form data:', this.checkoutForm.value);
      this.isLoading = false;
      this.snackBar.open('يرجى تصحيح الأخطاء قبل الإرسال', 'إغلاق', {
        duration: 3000,
        direction: 'rtl',
        verticalPosition: 'top',
      });
      return;
    }
    const orderData: CreateOrderDto = {
      phoneNumber: this.checkoutForm.value.phoneNumber,
      addressId: this.selectedAddressId,
      governorateId: this.useExistingAddress
        ? null
        : this.checkoutForm.value.governorateId,
      cityId: this.useExistingAddress ? null : this.checkoutForm.value.cityId,
      region: this.useExistingAddress ? null : this.checkoutForm.value.region,
    };
    this.orderService.placeOrder(orderData).subscribe({
      next: (order) => {
        this.isLoading = false;
        this.snackBar.open('تم تقديم الطلب بنجاح', 'إغلاق', {
          duration: 3000,
          verticalPosition: 'top',
          direction: 'rtl',
        });
        this.checkoutForm.reset();
        this.cartService.clearCart();
        this.router.navigate(['/orders', order.id]);
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
