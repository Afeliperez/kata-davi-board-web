import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { TokenStorageService } from '../../infrastructure/services/auth/token-storage.service';
import { SessionUiService } from '../shared/services/session-ui.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorageService = inject(TokenStorageService);
  const logoutUseCase = inject(LogoutUseCase);
  const sessionUiService = inject(SessionUiService);
  const router = inject(Router);

  const isLoginRoute = request.url.includes('/login');
  const hasValidToken = tokenStorageService.isTokenValid();

  if (!isLoginRoute && !hasValidToken && tokenStorageService.getToken()) {
    logoutUseCase.execute();
    sessionUiService.open('Tu token expiró. Volviste a la pantalla de inicio.');
    router.navigate(['/login']);

    return throwError(() => new Error('Token expirado'));
  }

  const token = tokenStorageService.getToken();

  const authRequest = token
    ? request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : request;

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRoute) {
        logoutUseCase.execute();
        sessionUiService.open('Tu sesión expiró. Inicia sesión nuevamente.');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
