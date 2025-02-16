import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import {
  AuthResponseModel,
  RegistrationDto,
  LoginDto,
} from '../../models/auth';
import { UserProfileService } from '../userProfile/user-profile.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `https://localhost:7085/api/Auth`;
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private userProfileService = inject(UserProfileService);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<any>(null);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();
  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState() {
    const refreshToken = this.cookieService.get('refreshToken');
    if (refreshToken) {
      const accessToken = this.cookieService.get('accessToken');
      if (!accessToken) {
        this.refreshAccessToken(refreshToken).subscribe({
          next: (response) => {
            this.isLoggedInSubject.next(true);
            this.loadCurrentUser().subscribe({
              error: () => this.clearAuthentication(),
            });
          },
          error: () => {
            this.clearAuthentication();
          },
        });
      } else {
        this.accessTokenSubject.next(accessToken);
        this.isLoggedInSubject.next(true);
        this.loadCurrentUser().subscribe({
          error: () => this.clearAuthentication(),
        });
      }
    }
  }

  private loadCurrentUser(): Observable<any> {
    return this.userProfileService.getCurrentUserProfile().pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError(() => of(null))
    );
  }

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
        this.handleAuthentication(response);
      }),
      catchError((error) => {
        console.error('Error while logging in: ', error);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    const refreshToken = this.cookieService.get('refreshToken');
    return this.http
      .post(`${this.baseUrl}/logout?refreshToken=${refreshToken}`, {})
      .pipe(
        tap(() => {
          this.clearAuthentication();
        }),
        catchError((error) => {
          this.clearAuthentication();
          return throwError(() => new error(error));
        })
      );
  }

  refreshAccessToken(refreshToken: string) {
    return this.http
      .get<any>(`${this.baseUrl}/refreshtoken?refreshToken=${refreshToken}`)
      .pipe(
        tap((response) =>
          this.setTokens(response.accessToken, response.refreshToken)
        ),
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
    this.isLoggedInSubject.next(true);
  }

  getAccessToken(): string | null {
    return this.cookieService.get('accessToken') || null;
  }

  private handleAuthentication(response: AuthResponseModel) {
    this.setTokens(response.accessToken, response.refreshToken);
    this.loadCurrentUser().subscribe();
  }
  
  private clearAuthentication() {
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('refreshToken', '/');
    this.accessTokenSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }
}
