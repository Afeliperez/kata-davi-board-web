import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AUTH_REPOSITORY } from '@domain/ports/auth-repository.port';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { TokenStorageService } from '@infrastructure/services/auth/token-storage.service';
import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';

describe('LoginUseCase', () => {
  const authRepositoryMock = {
    login: jest.fn(),
  };

  const tokenStorageMock = {
    saveToken: jest.fn(),
  };

  const authSessionServiceMock = {
    setUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        LoginUseCase,
        { provide: AUTH_REPOSITORY, useValue: authRepositoryMock },
        { provide: TokenStorageService, useValue: tokenStorageMock },
        { provide: AuthSessionService, useValue: authSessionServiceMock },
      ],
    });
  });

  it('stores session data on successful login', (done) => {
    authRepositoryMock.login.mockReturnValue(
      of({
        token: 'token',
        expiresAt: 123,
        user: { cc: '1', email: 'a@a.com', userName: 'u', role: 'DEV' },
      }),
    );

    const useCase = TestBed.inject(LoginUseCase);
    useCase.execute({ cc: '1', password: '12345678' }).subscribe({
      next: () => {
        expect(tokenStorageMock.saveToken).toHaveBeenCalledWith('token', 123);
        expect(authSessionServiceMock.setUser).toHaveBeenCalledWith({
          cc: '1', email: 'a@a.com', userName: 'u', role: 'DEV',
        });
        done();
      },
      error: done,
    });
  });
});
