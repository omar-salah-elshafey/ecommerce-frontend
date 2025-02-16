import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private baseUrl = 'https://localhost:7085/api/UserManagement';
  constructor(private http: HttpClient) {}
  getCurrentUserProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/get-current-user-profile`);
  }
}
