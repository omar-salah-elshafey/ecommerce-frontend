import { Injectable } from '@angular/core';
import { Category } from '../../../shared/models/category';
import { of } from 'rxjs';
import { Product } from '../../../shared/models/product';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  constructor() {}

  private categories: Category[] = [
    {
      id: 1,
      name: 'الإلكترونيات',
      icon: 'fa-solid fa-tv',
    },
    {
      id: 2,
      name: 'الملابس',
      icon: 'fa-solid fa-tshirt',
    },
    {
      id: 1,
      name: 'الإلكترونيات',
      icon: 'fa-solid fa-tv',
    },
    {
      id: 2,
      name: 'الملابس',
      icon: 'fa-solid fa-tshirt',
    },
    {
      id: 1,
      name: 'الإلكترونيات',
      icon: 'fa-solid fa-tv',
    },
    {
      id: 2,
      name: 'الملابس',
      icon: 'fa-solid fa-tshirt',
    },
  ];

  private products: Product[] = [
    {
      id: 1,
      name: 'سماعات لاسلكية',
      description: 'سماعات عالية الجودة مع عزل الضوضاء',
      price: 599,
      image: 'assets/images/headphones.jpg',
      stock: 10,
      category: 'electronics',
    },
    {
      id: 2,
      name: 'هاتف ذكي',
      description: 'أحدث موديل مع شاشة OLED',
      price: 3499,
      image: 'assets/images/phone.jpg',
      stock: 10,
      category: 'electronics',
    },
    {
      id: 1,
      name: 'سماعات لاسلكية',
      description: 'سماعات عالية الجودة مع عزل الضوضاء',
      price: 599,
      image: 'assets/images/headphones.jpg',
      stock: 10,
      category: 'electronics',
    },
    {
      id: 2,
      name: 'هاتف ذكي',
      description: 'أحدث موديل مع شاشة OLED',
      price: 3499,
      image: 'assets/images/phone.jpg',
      stock: 10,
      category: 'electronics',
    },
    {
      id: 1,
      name: 'سماعات لاسلكية',
      description: 'سماعات عالية الجودة مع عزل الضوضاء',
      price: 599,
      image: 'assets/images/headphones.jpg',
      stock: 10,
      category: 'electronics',
    },
    {
      id: 2,
      name: 'هاتف ذكي',
      description: 'أحدث موديل مع شاشة OLED',
      price: 3499,
      image: 'assets/images/phone.jpg',
      stock: 10,
      category: 'electronics',
    },
  ];

  getCategories() {
    return of(this.categories);
  }

  getFeaturedProducts() {
    return of(this.products);
  }
}
