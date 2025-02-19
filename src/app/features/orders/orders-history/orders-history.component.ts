import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdersService } from '../../../core/services/orders/orders.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderDto, OrderItemDto } from '../../../core/models/order';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders-history',
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './orders-history.component.html',
  styleUrl: './orders-history.component.scss',
})
export class OrdersHistoryComponent implements OnInit {
  ngOnInit(): void {
    this.loadOrders();
  }
  private snackBar = inject(MatSnackBar);
  private orderService = inject(OrdersService);

  ordersHistory: OrderDto[] = [];
  orderHistoryItems: OrderItemDto[] = [];
  isLoading = false;
  filter: 'all' | 'inProgress' = 'all';

  loadOrders() {
    this.filter === 'all' ? this.getOrderHistory() : this.getInProgressOrders();
  }

  onFilterChange(filter: 'all' | 'inProgress') {
    this.filter = filter;
    this.loadOrders();
  }

  getOrderHistory() {
    this.isLoading = true;
    this.orderService.getUserOrdersHistory().subscribe({
      next: (orders) => {
        this.ordersHistory = orders;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('خطأ في تحميل البيانات', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  getInProgressOrders() {
    this.isLoading = true;
    this.orderService.getUserInProgrssOrders().subscribe({
      next: (orders) => {
        this.ordersHistory = orders;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('خطأ في تحميل البيانات', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  translateOrderStatus(status: string): string {
    const translations: { [key: string]: string } = {
      Pending: 'قيد الانتظار',
      Processing: 'جاري التجهيز',
      Shipped: 'تم الشحن',
      Delivered: 'تم التسليم',
      Cancelled: 'ملغى',
    };
    return translations[status] || status;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Pending':
        return 'hourglass_empty';
      case 'Processing':
        return 'autorenew';
      case 'Shipped':
        return 'local_shipping';
      case 'Delivered':
        return 'check_circle';
      case 'Cancelled':
        return 'cancel';
      default:
        return 'hourglass_empty';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Processing':
        return 'blue';
      case 'Shipped':
        return 'purple';
      case 'Delivered':
        return 'green';
      case 'Cancelled':
        return 'red';
      default:
        return 'grey';
    }
  }
}
