import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderDto, OrderItemDto } from '../../../core/models/order';
import { OrdersService } from '../../../core/services/orders/orders.service';
import { environment } from '../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-order-details',
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
    MatTooltipModule,
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.orderService.getOrderById(orderId).subscribe({
        next: (order) => {
          this.order = order;
          this.orderItems = order.items;
        },
        error: (err) => {
          console.error('Failed to load order:', err);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  private snackBar = inject(MatSnackBar);
  private orderService = inject(OrdersService);
  private route = inject(ActivatedRoute);

  order!: OrderDto;
  orderItems: OrderItemDto[] = [];
  isLoading = true;

  cancelOrder(order: OrderDto) {
    if (!confirm('هل أنت متأكد من إلغاء الطلب؟')) return;
    this.isLoading = true;
    this.orderService.cancelOrder(order.id).subscribe({
      next: (order) => {
        this.order = order;
        this.orderItems = order.items;
        this.isLoading = false;
        this.snackBar.open('تم إلغاء الطلب', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error cancelling the order:', error);
        this.isLoading = false;
        this.snackBar.open('حدث خطأ أثناء إلغاء الطلب', 'إغلاق', {
          duration: 3000,
          direction: 'rtl',
          verticalPosition: 'top',
        });
      },
    });
  }

  getImageUrl(imageUrl: string): string {
    return `${environment.apiUrl}/${imageUrl}`;
  }

  canCancelOrder(order: OrderDto): boolean {
    return order.status === 'Processing' || order.status === 'Pending';
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
