import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import {
  AuthResponseModel,
  RegistrationDto,
  LoginDto,
} from '../../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `https://localhost:7085/api/Auth`;
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  constructor() {}

  registerUser(
    registrationData: RegistrationDto
  ): Observable<AuthResponseModel> {
    return this.http
      .post<AuthResponseModel>(
        `${this.baseUrl}/register-user`,
        registrationData
      )
      .pipe(
        tap((response) => {
          console.log('User registered successfully: ', response);
        }),
        catchError((error) => {
          console.error('Error while registering: ', error);
          return throwError(() => error);
        })
      );
  }

  login(userData: LoginDto): Observable<AuthResponseModel> {
    return this.http.post(`${this.baseUrl}/login`, userData).pipe(
      tap((response: any) => {
        this.setTokens(response.accessToken, response.refreshToken);
      }),
      catchError((error) => {
        console.error('Error while logging in: ', error);
        return throwError(() => error);
      })
    );
  }

  isLoggedIn() {
    return this.cookieService.check('refreshToken');
  }

  logout(): Observable<any> {
    const refreshToken = this.cookieService.get('refreshToken');
    return this.http
      .post(`${this.baseUrl}/logout?refreshToken=${refreshToken}`, {})
      .pipe(
        tap(() => {
          this.cookieService.delete('accessToken', '/');
          this.cookieService.delete('refreshToken', '/');
          this.accessTokenSubject.next(null);
        }),
        catchError((error) => {
          console.error('Error during logout:', error);
          return throwError(() => new error(error));
        })
      );
  }

  refreshAccessToken(refreshToken: string) {
    return this.http
      .get<any>(`${this.baseUrl}/refreshtoken?refreshToken=${refreshToken}`)
      .pipe(
        catchError((error) => {
          console.error('Token refresh failed:', error);
          return throwError(() => new error(error));
        })
      );
  }

  setTokens(accessToken: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    this.cookieService.set(
      'accessToken',
      accessToken,
      expiresAt,
      '/',
      '',
      true,
      'Strict'
    );
    this.cookieService.set(
      'refreshToken',
      encodeURIComponent(refreshToken),
      1,
      '/',
      '',
      true,
      'Strict'
    );
    this.accessTokenSubject.next(accessToken);
  }
}
