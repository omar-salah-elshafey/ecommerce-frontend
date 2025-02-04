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

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'blogs/:id', component: BlogDetailsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' },
];
