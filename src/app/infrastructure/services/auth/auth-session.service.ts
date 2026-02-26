import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from '../../../domain/ports/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly userKey = 'auth_user';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  readonly user$ = this.userSubject.asObservable();

  setUser(user: AuthUser): void {
    this.userSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUserSnapshot(): AuthUser | null {
    return this.userSubject.value;
  }

  clear(): void {
    this.userSubject.next(null);
    localStorage.removeItem(this.userKey);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const rawUser = localStorage.getItem(this.userKey);
      return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
