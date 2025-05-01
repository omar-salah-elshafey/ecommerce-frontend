import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, take, map } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.currentUser$.pipe(
    filter((user) => user !== null),
    take(1),
    map((user) => {
      const isAllowed =
        user.role.toLowerCase() === 'admin' ||
        user.role.toLowerCase() === 'superadmin' ||
        user.role.toLowerCase() === 'partner';

      if (!isAllowed) {
        router.navigateByUrl('/home');
        return false;
      }
      return true;
    })
  );
};
