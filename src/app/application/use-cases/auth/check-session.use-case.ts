import { inject, Injectable } from '@angular/core';
import { TokenStorageService } from '@infrastructure/services/auth/token-storage.service';

@Injectable({ providedIn: 'root' })
export class CheckSessionUseCase {
  private readonly tokenStorageService = inject(TokenStorageService);

  execute(): boolean {
    return this.tokenStorageService.isTokenValid();
  }
}
