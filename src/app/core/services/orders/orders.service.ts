import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  AddressDto,
  CityDto,
  CreateOrderDto,
  GovernorateDto,
  OrderDto,
} from '../../models/order';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../models/pagination';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly apiUrl = `${environment.apiUrl}/api/Orders`;
  constructor(private http: HttpClient) {}

  getUserAddresses(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(`${this.apiUrl}/user-addresses`);
  }

  getGovernorates(): Observable<GovernorateDto[]> {
    return this.http.get<GovernorateDto[]>(`${this.apiUrl}/governorates`);
  }

  getCities(governorateId: string): Observable<CityDto[]> {
    return this.http.get<CityDto[]>(
      `${this.apiUrl}/governorates/${governorateId}/cities`
    );
  }

  placeOrder(orderData: CreateOrderDto): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.apiUrl}/place-order`, orderData);
  }

  getUserOrdersHistory(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(
      `${this.apiUrl}/get-current-user-orders-history`
    );
  }

  getUserInProgrssOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(
      `${this.apiUrl}/get-current-user-in-progress-orders`
    );
  }

  getOrderById(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.apiUrl}/get-order-by-id/${id}`);
  }

  cancelOrder(orderId: string): Observable<OrderDto> {
    return this.http.put<OrderDto>(
      `${this.apiUrl}/cancel-order/${orderId}`,
      {}
    );
  }

  getAllOrders(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<OrderDto>> {
    return this.http.get<PaginatedResponse<OrderDto>>(
      `${this.apiUrl}/get-all-orders-history`,
      {
        params: {
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        },
      }
    );
  }

  getOrdersCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  getInProgressOrdersCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/in-progress`);
  }
}
