import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
  LoginRequest,
} from '@domain/ports/auth-repository.port';
import { TokenStorageService } from '@infrastructure/services/auth/token-storage.service';
import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly authRepository = inject(AUTH_REPOSITORY) as AuthRepositoryPort;
  private readonly tokenStorageService = inject(TokenStorageService);
  private readonly authSessionService = inject(AuthSessionService);

  execute(payload: LoginRequest) {
    return this.authRepository.login(payload).pipe(
      tap((authSession) => {
        this.tokenStorageService.saveToken(authSession.token, authSession.expiresAt);
        this.authSessionService.setUser(authSession.user);
      }),
    );
  }
}
