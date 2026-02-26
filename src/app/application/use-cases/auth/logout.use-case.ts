import { inject, Injectable } from '@angular/core';
import { TokenStorageService } from '@infrastructure/services/auth/token-storage.service';
import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';

@Injectable({ providedIn: 'root' })
export class LogoutUseCase {
  private readonly tokenStorageService = inject(TokenStorageService);
  private readonly authSessionService = inject(AuthSessionService);

  execute(): void {
    this.tokenStorageService.clear();
    this.authSessionService.clear();
  }
}
