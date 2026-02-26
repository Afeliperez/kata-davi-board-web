import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CheckSessionUseCase } from '@application/use-cases/auth/check-session.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { SessionUiService } from '@presentation/shared/services/session-ui.service';
import { authGuard } from '@presentation/guards/auth.guard';

describe('authGuard', () => {
  const checkSessionUseCaseMock = {
    execute: jest.fn<boolean, []>(),
  };

  const logoutUseCaseMock = {
    execute: jest.fn<void, []>(),
  };

  const sessionUiServiceMock = {
    open: jest.fn<void, [string]>(),
  };

  const routerMock = {
    parseUrl: jest.fn((url: string) => ({ redirectedTo: url })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: CheckSessionUseCase, useValue: checkSessionUseCaseMock },
        { provide: LogoutUseCase, useValue: logoutUseCaseMock },
        { provide: SessionUiService, useValue: sessionUiServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('returns true for valid session', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('redirects and opens modal for invalid session', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(logoutUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(sessionUiServiceMock.open).toHaveBeenCalledWith(
      'Tu token expiró. Debes iniciar sesión nuevamente.',
    );
    expect(routerMock.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toEqual({ redirectedTo: '/login' });
  });
});
