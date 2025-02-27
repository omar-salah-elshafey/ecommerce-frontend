import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/pagination';
import {
  AddCategoryDto,
  CategoryDto,
  UpdateCategoryDto,
} from '../../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/Categories/`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.apiUrl}get-all-categories`);
  }

  deleteCategory(id: string) {
    return this.http.delete(`${this.apiUrl}delete-category/${id}`);
  }

  updateCategory(id: string, dto: UpdateCategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(
      `${this.apiUrl}update-category/${id}`,
      dto
    );
  }

  addCategory(dto: AddCategoryDto) {
    return this.http.post(`${this.apiUrl}add-category`, dto);
  }
}
