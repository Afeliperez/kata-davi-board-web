import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckSessionUseCase } from '@application/use-cases/auth/check-session.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { SessionUiService } from '@presentation/shared/services/session-ui.service';

export const authGuard: CanActivateFn = () => {
  const checkSessionUseCase = inject(CheckSessionUseCase);
  const logoutUseCase = inject(LogoutUseCase);
  const sessionUiService = inject(SessionUiService);
  const router = inject(Router);

  if (checkSessionUseCase.execute()) {
    return true;
  }

  logoutUseCase.execute();
  sessionUiService.open('Tu token expiró. Debes iniciar sesión nuevamente.');

  return router.parseUrl('/login');
};
