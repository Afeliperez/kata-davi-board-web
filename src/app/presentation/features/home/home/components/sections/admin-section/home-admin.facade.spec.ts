import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ManageAdminUsersUseCase } from '@application/use-cases/home/manage-admin-users.use-case';
import { HomeAdminFacade } from '@presentation/features/home/home/components/sections/admin-section/home-admin.facade';

describe('HomeAdminFacade', () => {
  const useCaseMock = {
    listUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCaseMock.listUsers.mockReturnValue(of([]));
    useCaseMock.createUser.mockReturnValue(of(null));
    useCaseMock.updateUser.mockReturnValue(of(null));
    useCaseMock.deleteUser.mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        HomeAdminFacade,
        { provide: ManageAdminUsersUseCase, useValue: useCaseMock },
      ],
    });
  });

  it('delegates all admin operations', () => {
    const facade = TestBed.inject(HomeAdminFacade);
    facade.listUsers().subscribe();
    facade.createUser({} as never).subscribe();
    facade.updateUser('1', {} as never).subscribe();
    facade.deleteUser('1').subscribe();

    expect(useCaseMock.listUsers).toHaveBeenCalled();
    expect(useCaseMock.createUser).toHaveBeenCalled();
    expect(useCaseMock.updateUser).toHaveBeenCalledWith('1', {});
    expect(useCaseMock.deleteUser).toHaveBeenCalledWith('1');
  });
});
