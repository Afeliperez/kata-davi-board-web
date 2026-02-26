import { TestBed } from '@angular/core/testing';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { TokenStorageService } from '@infrastructure/services/auth/token-storage.service';
import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';

describe('LogoutUseCase', () => {
  const tokenStorageMock = { clear: jest.fn() };
  const authSessionServiceMock = { clear: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        LogoutUseCase,
        { provide: TokenStorageService, useValue: tokenStorageMock },
        { provide: AuthSessionService, useValue: authSessionServiceMock },
      ],
    });
  });

  it('clears token and user session', () => {
    const useCase = TestBed.inject(LogoutUseCase);
    useCase.execute();
    expect(tokenStorageMock.clear).toHaveBeenCalledTimes(1);
    expect(authSessionServiceMock.clear).toHaveBeenCalledTimes(1);
  });
});
