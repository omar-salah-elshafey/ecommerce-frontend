import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../../../shared/models/category';
import { PaginatedResponse } from '../../models/pagination';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/Categories/`;

  constructor(private http: HttpClient) {}

  getAllCategories(pageNumber: number, pageSize: number) {
    return this.http
      .get<PaginatedResponse<Category>>(`${this.apiUrl}get-all-categories`, {
        params: {
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        },
      })
      .pipe(map((response) => response.items));
  }
}
