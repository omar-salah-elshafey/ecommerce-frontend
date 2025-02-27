import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../../core/services/userProfile/user-profile.service';
import { ProductService } from '../../../core/services/product/product.service';
import { OrdersService } from '../../../core/services/orders/orders.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserDto } from '../../../core/models/user';
import { ProductDto } from '../../../core/models/product';
import { OrderDto } from '../../../core/models/order';

@Component({
  selector: 'app-main-view',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss',
})
export class MainViewComponent  implements OnInit{
  usersCount = 0;
  productsCount = 0;
  ordersCount = 0;
  inProgressOrdersCount = 0;
  recentUsers: UserDto[] = [];
  recentProducts: ProductDto[] = [];
  recentOrders: OrderDto[] = [];

  constructor(
    private userService: UserProfileService,
    private productService: ProductService,
    private orderService: OrdersService
  ) {}
  ngOnInit() {
    this.loadMetrics();
    this.loadRecentItems();
  }
  private loadMetrics() {
    this.userService
      .getUsersCount()
      .subscribe((res) => (this.usersCount = res));
    this.orderService
      .getOrdersCount()
      .subscribe((res) => (this.ordersCount = res));
    this.orderService
      .getInProgressOrdersCount()
      .subscribe((res) => (this.inProgressOrdersCount = res));
    this.productService
      .getProductsCount()
      .subscribe((res) => (this.productsCount = res));
  }
  private loadRecentItems() {
    this.userService
      .getAllUsers(1, 5)
      .subscribe((res) => (this.recentUsers = res.items));
    this.productService
      .getAllProducts(1, 5)
      .subscribe((res) => (this.recentProducts = res.items));
    this.orderService
      .getAllOrders(1, 5)
      .subscribe((res) => (this.recentOrders = res.items));
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

  translateRole(role: string): string {
    const translations: { [key: string]: string } = {
      user: 'عميل',
      admin: 'مسؤول'
    };
    return translations[role.toLowerCase()] || role;
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
