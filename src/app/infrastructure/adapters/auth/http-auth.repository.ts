import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  AuthRepositoryPort,
  AuthSession,
  LoginRequest,
} from '../../../domain/ports/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class HttpAuthRepository implements AuthRepositoryPort {
  private readonly loginUrl = '/kata-api/users/login';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<{
        token?: string;
        accessToken?: string;
        data?: {
          token?: string;
          accessToken?: string;
          user?: {
            cc?: string;
            email?: string;
            userName?: string;
            role?: string;
          };
        };
        expiresAt?: number;
        expiresIn?: number;
      }>(this.loginUrl, payload)
      .pipe(
        map((response) => {
          const token =
            response.data?.token ??
            response.data?.accessToken ??
            response.token ??
            response.accessToken;

          if (!token) {
            throw new Error('La respuesta del login no incluye token');
          }

          const user = response.data?.user;

          if (!user?.cc || !user?.email || !user?.userName || !user?.role) {
            throw new Error('La respuesta del login no incluye el usuario');
          }

          const expiresAt =
            response.expiresAt ??
            this.getJwtExpiration(token) ??
            Date.now() + (response.expiresIn ?? 300) * 1000;

          return {
            token,
            expiresAt,
            user: {
              cc: user.cc,
              email: user.email,
              userName: user.userName,
              role: user.role,
            },
          };
        }),
      );
  }

  private getJwtExpiration(token: string): number | null {
    try {
      const [, payloadPart] = token.split('.');

      if (!payloadPart) {
        return null;
      }

      const normalizedBase64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(normalizedBase64);
      const payload = JSON.parse(decodedPayload) as { exp?: number };

      if (!payload.exp) {
        return null;
      }

      return payload.exp * 1000;
    } catch {
      return null;
    }
  }
}
