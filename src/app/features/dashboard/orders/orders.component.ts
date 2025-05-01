import { Component, HostListener, OnInit } from '@angular/core';
import {
  OrderDto,
  OrderStatus,
  UpdateOrderStatusDto,
} from '../../../core/models/order';
import { OrdersService } from '../../../core/services/orders/orders.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-orders',
  imports: [
    RouterModule,
    MatCardModule,
    CommonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  orders: OrderDto[] = [];
  private currentPage: number = 1;
  private pageSize: number = 10;
  isLoading: boolean = false;
  private hasMore: boolean = true;

  OrderStatus = OrderStatus;
  filter: 'all' | 'inProgress' = 'all';

  orderStatuses: { value: OrderStatus; label: string }[] = [
    { value: OrderStatus.Pending, label: 'قيد الانتظار' },
    { value: OrderStatus.Processing, label: 'جاري التجهيز' },
    { value: OrderStatus.Shipped, label: 'تم الشحن' },
    { value: OrderStatus.Delivered, label: 'تم التسليم' },
    { value: OrderStatus.Cancelled, label: 'ملغى' },
  ];

  selectedStatuses: { [orderId: string]: OrderStatus } = {};

  constructor(
    private orderService: OrdersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllOrders();
  }

  getAllOrders(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.orderService.getAllOrders(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.orders = [...this.orders, ...res.items];
        this.currentPage++;
        this.hasMore = res.items.length === this.pageSize;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.snackBar.open('خطأ في تحميل الطلبات', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
    });
  }

  getInProgressOrders(): void {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.orderService
      .getAllInProgressOrders(this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.orders = [...this.orders, ...res.items];
          this.currentPage++;
          this.hasMore = res.items.length === this.pageSize;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.snackBar.open('خطأ في تحميل الطلبات', 'إغلاق', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.isLoading = false;
        },
      });
  }

  loadOrders() {
    this.filter === 'all' ? this.getAllOrders() : this.getInProgressOrders();
  }

  onFilterChange(filter: 'all' | 'inProgress') {
    this.currentPage = 1;
    this.orders = [];
    this.hasMore = true;
    this.filter = filter;
    this.loadOrders();
  }

  updateOrderStatus(order: OrderDto): void {
    const newStatus = this.selectedStatuses[order.id];
    if (!newStatus || order.status === OrderStatus[newStatus]) return;

    const dto: UpdateOrderStatusDto = {
      orderId: order.id,
      newStatus: newStatus,
    };
    this.isLoading = true;

    this.orderService.updateOrderStatus(dto).subscribe({
      next: (updatedOrder) => {
        order.status = updatedOrder.status;
        delete this.selectedStatuses[order.id];
        this.snackBar.open('تم تحديث حالة الطلب بنجاح', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        this.snackBar.open('خطأ في تحديث حالة الطلب', 'إغلاق', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.isLoading = false;
      },
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 200) {
      this.loadOrders();
    }
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

  getStatusEnumValue(status: string): OrderStatus {
    return OrderStatus[status as keyof typeof OrderStatus];
  }
}
