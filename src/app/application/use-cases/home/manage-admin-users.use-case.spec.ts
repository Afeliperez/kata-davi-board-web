import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HOME_DATA_REPOSITORY } from '@domain/ports/home-data-repository.port';
import { ManageAdminUsersUseCase } from '@application/use-cases/home/manage-admin-users.use-case';

describe('ManageAdminUsersUseCase', () => {
  const repositoryMock = {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [ManageAdminUsersUseCase, { provide: HOME_DATA_REPOSITORY, useValue: repositoryMock }],
    });
  });

  it('normalizes users payload to array', (done) => {
    repositoryMock.getUsers.mockReturnValue(of({ endpoint: '/users', data: { data: { cc: '1' } } }));
    const useCase = TestBed.inject(ManageAdminUsersUseCase);
    useCase.listUsers().subscribe({
      next: (users) => {
        expect(users).toEqual([{ cc: '1' }]);
        done();
      },
      error: done,
    });
  });

  it('keeps users payload when it is already an array', (done) => {
    repositoryMock.getUsers.mockReturnValue(of({ endpoint: '/users', data: { data: [{ cc: '1' }, { cc: '2' }] } }));
    const useCase = TestBed.inject(ManageAdminUsersUseCase);
    useCase.listUsers().subscribe({
      next: (users) => {
        expect(users).toEqual([{ cc: '1' }, { cc: '2' }]);
        done();
      },
      error: done,
    });
  });

  it('delegates create/update/delete operations', () => {
    repositoryMock.createUser.mockReturnValue(of(null));
    repositoryMock.updateUser.mockReturnValue(of(null));
    repositoryMock.deleteUser.mockReturnValue(of(null));
    const useCase = TestBed.inject(ManageAdminUsersUseCase);

    useCase.createUser({ cc: '1', email: 'a', userName: 'u', role: 'DEV', password: '12345678' } as never).subscribe();
    useCase.updateUser('1', { email: 'b', userName: 'u2', role: 'QA' } as never).subscribe();
    useCase.deleteUser('1').subscribe();

    expect(repositoryMock.createUser).toHaveBeenCalled();
    expect(repositoryMock.updateUser).toHaveBeenCalledWith('1', { email: 'b', userName: 'u2', role: 'QA' });
    expect(repositoryMock.deleteUser).toHaveBeenCalledWith('1');
  });
});
