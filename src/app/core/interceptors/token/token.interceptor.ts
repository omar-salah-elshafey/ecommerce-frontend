import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  EMPTY,
} from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);
import { CookieService } from 'ngx-cookie-service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const cookieService = inject(CookieService);
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const accessToken = cookieService.get('accessToken');
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
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshAccessToken(refreshToken).pipe(
            switchMap(({ accessToken, refreshToken }) => {
              authService.setTokens(accessToken, refreshToken);
              isRefreshing = false;
              refreshTokenSubject.next(accessToken);
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${accessToken}` },
                })
              );
            }),
            catchError((err) => {
              authService.logout();
              router.navigate(['/login']);
              return EMPTY;
            })
          );
        } else {
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) =>
              next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${token}` },
                })
              )
            )
          );
        }
      }
      return throwError(() => error);
    })
  );
};
