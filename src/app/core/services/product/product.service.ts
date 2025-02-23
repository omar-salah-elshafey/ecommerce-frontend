import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { PaginatedResponse } from '../../models/pagination';
import { ProductDto, ProductImage } from '../../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/api/Products`;
  constructor(private http: HttpClient) {}

  private getMainImage(images: ProductImage[]): string | null {
    const mainImage = images.find((img) => img.isMain);
    return mainImage ? `${environment.apiUrl}${mainImage.imageUrl}` : null;
  }

  getFeaturedProducts(pageNumber = 1, pageSize = 10): Observable<ProductDto[]> {
    return this.http
      .get<PaginatedResponse<ProductDto>>(`${this.apiUrl}/featured`, {
        params: {
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        },
      })
      .pipe(
        map((response) => {
          return response.items.map((product) => ({
            ...product,
            mainImageUrl:
              this.getMainImage(product.images) ||
              'assets/images/placeholder.png',
          }));
        })
      );
  }

  getBestSellers(): Observable<ProductDto[]> {
    return this.http.get<ProductDto[]>(`${this.apiUrl}/best-sellers`).pipe(
      map((products) =>
        products.map((product) => ({
          ...product,
          mainImageUrl:
            this.getMainImage(product.images) ||
            'assets/images/placeholder.png',
        }))
      )
    );
  }

  getAllProducts(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<ProductDto>> {
    return this.http
      .get<PaginatedResponse<ProductDto>>(`${this.apiUrl}/get-all-products`, {
        params: {
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((product) => ({
            ...product,
            mainImageUrl:
              this.getMainImage(product.images) ||
              'assets/images/placeholder.png',
          })),
        }))
      );
  }

  getProductById(id: string): Observable<ProductDto> {
    return this.http
      .get<ProductDto>(`${this.apiUrl}/get-product-by-id/${id}`)
      .pipe(
        map((product) => ({
          ...product,
          images: product.images.map((img) => ({
            ...img,
            imageUrl: `${environment.apiUrl}${img.imageUrl}`,
          })),
          mainImageUrl:
            this.getMainImage(product.images) ||
            'assets/images/placeholder.png',
        }))
      );
  }

  getProductsByCategoryIds(
    categoryIds: string[],
    pageNumber = 1,
    pageSize = 10
  ): Observable<PaginatedResponse<ProductDto>> {
    let params = new HttpParams();
    categoryIds.forEach((id) => {
      params = params.append('categoryIds', id);
    });
    params = params.append('PageNumber', pageNumber.toString());
    params = params.append('PageSize', pageSize.toString());

    return this.http
      .get<PaginatedResponse<ProductDto>>(`${this.apiUrl}/categoryIds`, {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((product) => ({
            ...product,
            mainImageUrl:
              this.getMainImage(product.images) ||
              'assets/images/placeholder.png',
          })),
        }))
      );
  }

  searchProducts(
    query: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<ProductDto>> {
    return this.http
      .get<PaginatedResponse<ProductDto>>(`${this.apiUrl}/name/${query}`, {
        params: {
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((product) => ({
            ...product,
            mainImageUrl:
              this.getMainImage(product.images) ||
              'assets/images/placeholder.png',
          })),
        }))
      );
  }
}
