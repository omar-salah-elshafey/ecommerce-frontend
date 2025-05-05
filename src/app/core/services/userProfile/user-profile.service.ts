import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChangeUserRoleDto,
  DeleteProfile,
  UpdateUserDto,
  UserDto,
} from '../../models/user';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../models/pagination';

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
    userId: string,
    updateUserDto: UpdateUserDto
  ): Observable<UserDto> {
    return this.http.put<any>(
      `${this.baseUrl}/update-user/${userId}`,
      updateUserDto
    );
  }

  deleteProfile(userData: DeleteProfile) {
    return this.http.delete(`${this.baseUrl}/delete-user`, { body: userData });
  }

  getAllUsers(
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<UserDto>> {
    return this.http.get<PaginatedResponse<UserDto>>(
      `${this.baseUrl}/get-all-users`,
      {
        params: {
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        },
      }
    );
  }

  getUsersCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/get-users-count`);
  }

  getUserProfile(userName: string): Observable<UserDto> {
    return this.http.get<UserDto>(
      `${this.baseUrl}/get-user-profile/${userName}`
    );
  }

  searchUsers(
    query: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PaginatedResponse<UserDto>> {
    return this.http.get<PaginatedResponse<UserDto>>(
      `${this.baseUrl}/search-users/${query}`,
      {
        params: {
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        },
      }
    );
  }

  changeUserRole(changeRoleDto: ChangeUserRoleDto) {
    return this.http.put(`${this.baseUrl}/change-user-role`, changeRoleDto);
  }
}
