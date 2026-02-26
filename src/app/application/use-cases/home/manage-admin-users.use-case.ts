import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import {
  CreateUserCommand,
  HOME_DATA_REPOSITORY,
  HomeDataRepositoryPort,
  UpdateUserCommand,
} from '@domain/ports/home-data-repository.port';

@Injectable({ providedIn: 'root' })
export class ManageAdminUsersUseCase {
  private readonly homeDataRepository = inject(HOME_DATA_REPOSITORY) as HomeDataRepositoryPort;

  listUsers() {
    return this.homeDataRepository.getUsers().pipe(
      map((result) => {
        const users = result.data.data;
        return Array.isArray(users) ? users : [users];
      }),
    );
  }

  createUser(payload: CreateUserCommand) {
    return this.homeDataRepository.createUser(payload);
  }

  updateUser(cc: string, payload: UpdateUserCommand) {
    return this.homeDataRepository.updateUser(cc, payload);
  }

  deleteUser(cc: string) {
    return this.homeDataRepository.deleteUser(cc);
  }
}
