import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChangePasswordDto, ResetPasswordDto } from '../../models/password';

interface VerifyTokenRequest {
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private baseUrl = `${environment.apiUrl}/api/PasswordManager/`;

  constructor(private http: HttpClient) {}

  resetPasswordRequest(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}reset-password-request/${email}`, {});
  }

  verifyResetPasswordToken(userData: VerifyTokenRequest): Observable<any> {
    return this.http.post(
      `${this.baseUrl}verify-password-reset-token`,
      userData
    );
  }

  resetPassword(userData: ResetPasswordDto): Observable<any> {
    return this.http.put(`${this.baseUrl}reset-password`, userData);
  }

  changePassword(userData: ChangePasswordDto): Observable<any> {
    return this.http.put(`${this.baseUrl}change-password`, userData);
  }
}
