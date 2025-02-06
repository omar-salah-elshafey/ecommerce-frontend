import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

interface VerifyTokenRequest {
  email: string;
  token: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private baseUrl = 'https://localhost:7085/api/PasswordManager/';

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

  resetPassword(userData: ResetPasswordData): Observable<any> {
    console.log('test');
    return this.http.put(`${this.baseUrl}reset-password`, userData);
  }

  changePassword(userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}change-password`, userData).pipe(
      tap((response) => {
        console.log('Changing the Password: ', response);
      }),
      catchError((error) => {
        console.error('Error Changing the Password:', error);
        return throwError(() => new error(error));
      })
    );
  }
}
