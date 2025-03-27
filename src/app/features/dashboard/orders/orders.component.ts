import { Component, OnInit } from '@angular/core';
import { OrderDto } from '../../../core/models/order';
import { OrdersService } from '../../../core/services/orders/orders.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-orders',
  imports: [RouterModule, MatCardModule, CommonModule, MatIconModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  orders: OrderDto[] = [];

  constructor(private orderService: OrdersService) {}

  ngOnInit(): void {
    this.orderService
      .getAllOrders(1, 5)
      .subscribe((res) => (this.orders = res.items));
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
