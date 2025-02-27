import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { filter, map, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return authService.currentUser$.pipe(
    filter((user) => user !== null),
    take(1),
    map((user) => {
      const isAdmin = user.role.toLowerCase() === 'admin';
      if (!isAdmin) {
        router.navigateByUrl('/home');
      }
      return isAdmin;
    })
  );
};
