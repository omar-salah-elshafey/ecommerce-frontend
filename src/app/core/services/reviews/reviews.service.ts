import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CreateReviewDto,
  ReviewDto,
  UpdateReviewDto,
} from '../../models/review';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/pagination';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private readonly apiUrl = `${environment.apiUrl}/api/Reviews`;
  constructor(private http: HttpClient) {}

  getReviewsByProduct(
    productId: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<ReviewDto>> {
    return this.http.get<PaginatedResponse<ReviewDto>>(
      `${this.apiUrl}/get-review-by-product/${productId}`,
      {
        params: {
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        },
      }
    );
  }

  getAllReviews(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<ReviewDto>> {
    return this.http.get<PaginatedResponse<ReviewDto>>(
      `${this.apiUrl}/get-all-reviews`,
      {
        params: {
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        },
      }
    );
  }

  getReviewById(productId: string): Observable<PaginatedResponse<ReviewDto>> {
    return this.http.get<PaginatedResponse<ReviewDto>>(
      `${this.apiUrl}/get-review/${productId}`
    );
  }

  addReview(reviewData: CreateReviewDto): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(`${this.apiUrl}/add-review`, reviewData);
  }

  updateReview(id: string, reviewData: UpdateReviewDto): Observable<ReviewDto> {
    return this.http.put<ReviewDto>(
      `${this.apiUrl}/update-review/${id}`,
      reviewData
    );
  }

  deleteReview(id: string) {
    return this.http.delete(`${this.apiUrl}/delete-review/${id}`, {});
  }
}
