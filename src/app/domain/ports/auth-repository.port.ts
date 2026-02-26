import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginRequest {
  cc: string;
  password: string;
}

export interface AuthUser {
  cc: string;
  email: string;
  userName: string;
  role: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  user: AuthUser;
}

export interface AuthRepositoryPort {
  login(payload: LoginRequest): Observable<AuthSession>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepositoryPort>('AUTH_REPOSITORY');
