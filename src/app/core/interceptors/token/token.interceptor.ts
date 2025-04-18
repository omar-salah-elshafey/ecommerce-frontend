import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, from } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

let refreshPromise: Promise<string | null> | null = null;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const injector = inject(Injector);

  let accessToken = cookieService.get('accessToken');
  const refreshToken = cookieService.get('refreshToken');

  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && refreshToken) {
        if (!refreshPromise) {
          const authService = injector.get(AuthService);
          refreshPromise = firstValueFrom(
            authService.refreshAccessToken(refreshToken)
          )
            .then((newTokens) => {
              authService.setTokens(newTokens.accessToken, newTokens.refreshToken);
              refreshTokenSubject.next(newTokens.refreshToken);
              return newTokens.accessToken;
            })
            .catch((refreshError) => {
              console.error(
                `[${new Date().toISOString()}] Error during token refresh:`,
                refreshError
              );
              cookieService.delete('accessToken', '/');
              cookieService.delete('refreshToken', '/');
              router.navigate(['/login']);
              snackBar.open(
                'انتهت صلاحية الجلسة، برجاء إعادة تسجيل الدخول.',
                'إغلاق',
                {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                }
              );
              return null;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        return from(refreshPromise).pipe(
          switchMap((newAccessToken) => {
            if (!newAccessToken) {
              return throwError(() => new Error('Token refresh failed'));
            }
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
            return next(req);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
