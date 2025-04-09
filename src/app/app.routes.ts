import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductsComponent } from './features/products/products.component';
import { CartComponent } from './features/cart/cart.component';
import { BlogsComponent } from './features/blogs/blogs.component';
import { BlogDetailsComponent } from './features/blog-details/blog-details.component';
import { AboutUsComponent } from './features/about-us/about-us.component';
import { ProductDetailsComponent } from './features/product-details/product-details.component';
import { ContactUsComponent } from './features/contact-us/contact-us.component';
import { RegisterComponent } from './features/register/register.component';
import { LoginComponent } from './features/login/login.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { EmailConfirmationComponent } from './features/email-confirmation/email-confirmation.component';
import { ResetPasswordRequestComponent } from './features/reset-password/reset-password-request/reset-password-request.component';
import { ResetPasswordComponent } from './features/reset-password/reset-password/reset-password.component';
import { ProfileComponent } from './features/profile/profile.component';
import { PlaceOrderComponent } from './features/orders/place-order/place-order.component';
import { OrdersHistoryComponent } from './features/orders/orders-history/orders-history.component';
import { OrderDetailsComponent } from './features/orders/order-details/order-details.component';
import { authGuard } from './core/guards/auth/auth.guard';
import { guestGuard } from './core/guards/guest/guest.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { adminGuard } from './core/guards/admin/admin.guard';
import { ManageProductsComponent } from './features/dashboard/manage-products/manage-products.component';
import { MainViewComponent } from './features/dashboard/main-view/main-view.component';
import { CategoriesComponent } from './features/dashboard/categories/categories.component';
import { OrdersComponent } from './features/dashboard/orders/orders.component';
import { UsersComponent } from './features/dashboard/users/users.component';
import { AddUserComponent } from './features/dashboard/add-user/add-user.component';
import { CustomersMessagesComponent } from './features/dashboard/customers-messages/customers-messages.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blogs/:id', component: BlogDetailsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'confirm-email',
    component: EmailConfirmationComponent,
    canActivate: [guestGuard],
  },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: 'reset-password-request',
    component: ResetPasswordRequestComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [guestGuard],
  },
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
  {
    path: 'checkout',
    component: PlaceOrderComponent,
    canActivate: [authGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  {
    path: 'order-history',
    component: OrdersHistoryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'orders/:id',
    component: OrderDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: MainViewComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'products', component: ManageProductsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'users', component: UsersComponent },
      { path: 'add-user', component: AddUserComponent },
      { path: 'messages', component: CustomersMessagesComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
