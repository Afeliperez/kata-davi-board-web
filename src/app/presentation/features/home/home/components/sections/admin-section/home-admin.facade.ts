import { Injectable, inject } from '@angular/core';
import { ManageAdminUsersUseCase } from '../../../../../../../application/use-cases/home/manage-admin-users.use-case';
import { CreateUserCommand, UpdateUserCommand } from '../../../../../../../domain/ports/home-data-repository.port';

@Injectable({ providedIn: 'root' })
export class HomeAdminFacade {
  private readonly manageAdminUsersUseCase = inject(ManageAdminUsersUseCase);

  listUsers() {
    return this.manageAdminUsersUseCase.listUsers();
  }

  createUser(payload: CreateUserCommand) {
    return this.manageAdminUsersUseCase.createUser(payload);
  }

  updateUser(cc: string, payload: UpdateUserCommand) {
    return this.manageAdminUsersUseCase.updateUser(cc, payload);
  }

  deleteUser(cc: string) {
    return this.manageAdminUsersUseCase.deleteUser(cc);
  }
}
