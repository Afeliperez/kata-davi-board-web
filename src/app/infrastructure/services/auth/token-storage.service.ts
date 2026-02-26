import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenKey = 'auth_token';
  private readonly expirationKey = 'auth_token_expiration';

  saveToken(token: string, expiresAt: number): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expirationKey, String(expiresAt));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getExpiration(): number {
    const expiration = localStorage.getItem(this.expirationKey);
    return expiration ? Number(expiration) : 0;
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    return Date.now() < this.getExpiration();
  }

  clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expirationKey);
  }
}
