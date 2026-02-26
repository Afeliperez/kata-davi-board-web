import { TestBed } from '@angular/core/testing';
import { CheckSessionUseCase } from '@application/use-cases/auth/check-session.use-case';
import { TokenStorageService } from '@infrastructure/services/auth/token-storage.service';

describe('CheckSessionUseCase', () => {
  const tokenStorageMock = {
    isTokenValid: jest.fn<boolean, []>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        CheckSessionUseCase,
        { provide: TokenStorageService, useValue: tokenStorageMock },
      ],
    });
  });

  it('delegates token validation', () => {
    tokenStorageMock.isTokenValid.mockReturnValue(true);
    const useCase = TestBed.inject(CheckSessionUseCase);
    expect(useCase.execute()).toBe(true);
    expect(tokenStorageMock.isTokenValid).toHaveBeenCalledTimes(1);
  });
});
