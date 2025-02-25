import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeleteProfile, UpdateUserDto, UserDto } from '../../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private baseUrl = `${environment.apiUrl}/api/UserManagement`;
  constructor(private http: HttpClient) {}

  getCurrentUserProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/get-current-user-profile`);
  }

  updateProfile(
    userName: string,
    updateUserDto: UpdateUserDto
  ): Observable<UserDto> {
    return this.http.put<any>(
      `${this.baseUrl}/update-user/${userName}`,
      updateUserDto
    );
  }

  deleteProfile(userData: DeleteProfile) {
    return this.http.delete(
      `${this.baseUrl}/delete-user/${userData.userName}?refreshToken=${userData.refreshToken}`
    );
  }
}
