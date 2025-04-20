import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  AddCityDto,
  CityDto,
  GovernorateDto,
  UpdateGovernorateDto,
} from '../../models/address';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly apiUrl = `${environment.apiUrl}/api/Addresses`;
  constructor(private http: HttpClient) {}

  addGovernorate(name: string): Observable<GovernorateDto> {
    return this.http.post<GovernorateDto>(`${this.apiUrl}/add-governorate`, {
      name,
    });
  }

  updateGovernorate(
    id: string,
    data: UpdateGovernorateDto
  ): Observable<GovernorateDto> {
    return this.http.put<GovernorateDto>(
      `${this.apiUrl}/update-governorate/${id}`,
      data
    );
  }

  deleteGovernorate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-governorate/${id}`);
  }

  addCity(data: AddCityDto): Observable<CityDto> {
    return this.http.post<CityDto>(`${this.apiUrl}/add-city`, data);
  }

  updateCity(cityId: string, data: AddCityDto): Observable<CityDto> {
    return this.http.put<CityDto>(`${this.apiUrl}/update-city/${cityId}`, data);
  }

  deleteCity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-city/${id}`);
  }
}
