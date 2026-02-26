import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HOME_DATA_REPOSITORY } from '@domain/ports/home-data-repository.port';
import { GetHomeDataUseCase } from '@application/use-cases/home/get-home-data.use-case';

describe('GetHomeDataUseCase', () => {
  const repositoryMock = {
    getUsers: jest.fn(),
    getProjectBoards: jest.fn(),
    getProjectBoardsByAccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repositoryMock.getUsers.mockReturnValue(of({ endpoint: '/users', data: { data: [] } }));
    repositoryMock.getProjectBoards.mockReturnValue(of({ endpoint: '/boards', data: { data: [] } }));
    repositoryMock.getProjectBoardsByAccess.mockReturnValue(of({ endpoint: '/access', data: { data: [] } }));

    TestBed.configureTestingModule({
      providers: [GetHomeDataUseCase, { provide: HOME_DATA_REPOSITORY, useValue: repositoryMock }],
    });
  });

  it('uses admin strategy for ADMIN role', (done) => {
    const useCase = TestBed.inject(GetHomeDataUseCase);
    useCase.execute({ cc: '1', email: 'a', userName: 'u', role: 'ADMIN' }).subscribe({
      next: () => {
        expect(repositoryMock.getUsers).toHaveBeenCalledTimes(1);
        done();
      },
      error: done,
    });
  });

  it('uses scrum strategy for SM role', (done) => {
    const useCase = TestBed.inject(GetHomeDataUseCase);
    useCase.execute({ cc: '1', email: 'a', userName: 'u', role: 'SM' }).subscribe({
      next: () => {
        expect(repositoryMock.getProjectBoards).toHaveBeenCalledTimes(1);
        done();
      },
      error: done,
    });
  });

  it('uses access strategy for other roles', (done) => {
    const useCase = TestBed.inject(GetHomeDataUseCase);
    useCase.execute({ cc: '123', email: 'a', userName: 'u', role: 'DEV' }).subscribe({
      next: () => {
        expect(repositoryMock.getProjectBoardsByAccess).toHaveBeenCalledWith('123');
        done();
      },
      error: done,
    });
  });
});
