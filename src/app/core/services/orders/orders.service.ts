import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  CityDto,
  CreateOrderDto,
  GovernorateDto,
  OrderDto,
} from '../../models/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly apiUrl = `${environment.apiUrl}/api/Orders`;
  constructor(private http: HttpClient) {}

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
    return this.http.put<OrderDto>(`${this.apiUrl}cancel-order/${orderId}`, {});
  }
}
