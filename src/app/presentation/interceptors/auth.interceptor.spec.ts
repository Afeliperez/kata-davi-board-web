import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { TokenStorageService } from '@infrastructure/services/auth/token-storage.service';
import { SessionUiService } from '@presentation/shared/services/session-ui.service';
import { authInterceptor } from '@presentation/interceptors/auth.interceptor';

describe('authInterceptor', () => {
  const tokenStorageMock = {
    isTokenValid: jest.fn<boolean, []>(),
    getToken: jest.fn<string | null, []>(),
  };

  const logoutUseCaseMock = {
    execute: jest.fn<void, []>(),
  };

  const sessionUiServiceMock = {
    open: jest.fn<void, [string]>(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  const execute = (
    url: string,
    next: (request: HttpRequest<unknown>) => ReturnType<typeof of>,
  ) => TestBed.runInInjectionContext(() => authInterceptor(new HttpRequest('GET', url), next as never));

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: tokenStorageMock },
        { provide: LogoutUseCase, useValue: logoutUseCaseMock },
        { provide: SessionUiService, useValue: sessionUiServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('adds Authorization header when token exists', (done) => {
    tokenStorageMock.isTokenValid.mockReturnValue(true);
    tokenStorageMock.getToken.mockReturnValue('token-123');

    execute('/kata-api/users', (request) => {
      expect(request.headers.get('Authorization')).toBe('Bearer token-123');
      return of(new HttpResponse({ status: 200 }));
    }).subscribe({
      next: () => done(),
      error: done,
    });
  });

  it('continues request without Authorization when token is missing', (done) => {
    tokenStorageMock.isTokenValid.mockReturnValue(false);
    tokenStorageMock.getToken.mockReturnValue(null);

    execute('/kata-api/users', (request) => {
      expect(request.headers.has('Authorization')).toBe(false);
      return of(new HttpResponse({ status: 200 }));
    }).subscribe({
      next: () => done(),
      error: done,
    });
  });

  it('blocks request when token is expired', (done) => {
    tokenStorageMock.isTokenValid.mockReturnValue(false);
    tokenStorageMock.getToken.mockReturnValue('expired-token');

    const next = jest.fn();

    execute('/kata-api/project-boards', next as never).subscribe({
      next: () => done(new Error('Expected interceptor to throw for expired token')),
      error: (error) => {
        expect(String(error.message)).toContain('Token expirado');
        expect(next).not.toHaveBeenCalled();
        expect(logoutUseCaseMock.execute).toHaveBeenCalledTimes(1);
        expect(sessionUiServiceMock.open).toHaveBeenCalledWith(
          'Tu token expiró. Volviste a la pantalla de inicio.',
        );
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        done();
      },
    });
  });

  it('handles 401 by logging out and redirecting', (done) => {
    tokenStorageMock.isTokenValid.mockReturnValue(true);
    tokenStorageMock.getToken.mockReturnValue('valid-token');

    execute('/kata-api/users', () =>
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })) as never,
    ).subscribe({
      next: () => done(new Error('Expected interceptor to rethrow 401')),
      error: (error) => {
        expect(error.status).toBe(401);
        expect(logoutUseCaseMock.execute).toHaveBeenCalledTimes(1);
        expect(sessionUiServiceMock.open).toHaveBeenCalledWith(
          'Tu sesión expiró. Inicia sesión nuevamente.',
        );
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        done();
      },
    });
  });

  it('does not redirect for 401 on login route', (done) => {
    tokenStorageMock.isTokenValid.mockReturnValue(false);
    tokenStorageMock.getToken.mockReturnValue(null);

    execute('/kata-api/users/login', () =>
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })) as never,
    ).subscribe({
      next: () => done(new Error('Expected 401 to be rethrown')),
      error: (error) => {
        expect(error.status).toBe(401);
        expect(logoutUseCaseMock.execute).not.toHaveBeenCalled();
        expect(sessionUiServiceMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('rethrows service outage errors without forced logout', (done) => {
    tokenStorageMock.isTokenValid.mockReturnValue(true);
    tokenStorageMock.getToken.mockReturnValue('valid-token');

    execute('/kata-api/users', () =>
      throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' })) as never,
    ).subscribe({
      next: () => done(new Error('Expected 503 to be rethrown')),
      error: (error) => {
        expect(error.status).toBe(503);
        expect(logoutUseCaseMock.execute).not.toHaveBeenCalled();
        expect(sessionUiServiceMock.open).not.toHaveBeenCalled();
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
