import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Product } from '../../../shared/models/product';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private productsSubject = new BehaviorSubject<Product[]>([
    {
      id: 1,
      name: 'Laptop1',
      description: 'لابتوب عالي المواصفات',
      price: 1500,
      category: 'electronics',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 2,
      name: 'Laptop2',
      description: 'لابتوب عالي المواصفات',
      price: 2500,
      category: 'clothing',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 3,
      name: 'Laptop3',
      description: 'لابتوب عالي المواصفات',
      price: 3500,
      category: 'books',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 4,
      name: 'Laptop4',
      description: 'لابتوب عالي المواصفات',
      price: 4500,
      category: 'electronics',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 5,
      name: 'Laptop5',
      description: 'لابتوب عالي المواصفات',
      price: 5500,
      category: 'clothing',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 6,
      name: 'Laptop6',
      description: 'لابتوب عالي المواصفات',
      price: 6500,
      category: 'books',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 7,
      name: 'Laptop7',
      description: 'لابتوب عالي المواصفات',
      price: 7500,
      category: 'electronics',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 8,
      name: 'Laptop8',
      description: 'لابتوب عالي المواصفات',
      price: 8500,
      category: 'clothing',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
    {
      id: 9,
      name: 'Laptop9',
      description: 'لابتوب عالي المواصفات',
      price: 9500,
      category: 'books',
      image: 'assets/images/laptop.png',
      stock: 10,
    },
  ]);

  private categories = ['electronics', 'clothing', 'books'];

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getCategories(): Observable<string[]> {
    return of(this.categories);
  }

  // products.service.ts
  filterProducts(filters: any): Observable<Product[]> {
    return this.productsSubject.pipe(
      map((products) =>
        products.filter((product) => {
          const price = product.price;
          return (
            (!filters.category || product.category === filters.category) &&
            price >= filters.minPrice &&
            price <= filters.maxPrice
          ); // Changed to AND condition
        })
      )
    );
  }
}
