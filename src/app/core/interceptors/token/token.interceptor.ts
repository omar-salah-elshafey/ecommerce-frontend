import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  EMPTY,
  tap,
} from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const snackBar = inject(MatSnackBar);

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
          const authService = injector.get(AuthService);
          return authService.refreshAccessToken(refreshToken).pipe(
            tap((newTokens) => {
              isRefreshing = false;
              refreshTokenSubject.next(newTokens.accessToken);
            }),
            switchMap((newTokens) => {
              return next(
                req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newTokens.accessToken}`,
                  },
                })
              );
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next(null);
              authService.logout().subscribe(() => {
                router.navigate(['/login']);
              });
              snackBar.open(
                'انتهت صلاحية الجلسة، برجاء إعادة تسجيل الدخول',
                'إغلاق',
                {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                }
              );
              return throwError(() => refreshError);
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
