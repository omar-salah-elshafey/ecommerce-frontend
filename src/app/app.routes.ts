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
  { path: 'wishlist', component: WishlistComponent },
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
  { path: '**', redirectTo: '' },
];
