import { inject, Injectable } from '@angular/core';
import {
  HOME_DATA_REPOSITORY,
  HomeDataRepositoryPort,
  HomeRoleStrategy,
} from '@domain/ports/home-data-repository.port';
import { AuthUser } from '@domain/ports/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class GetHomeDataUseCase {
  private readonly homeDataRepository = inject(HOME_DATA_REPOSITORY) as HomeDataRepositoryPort;

  private readonly roleStrategies: Record<string, HomeRoleStrategy> = {
    ADMIN: () => this.homeDataRepository.getUsers(),
    SM: () => this.homeDataRepository.getProjectBoards(),
  };

  execute(user: AuthUser): ReturnType<HomeRoleStrategy> {
    const strategy =
      this.roleStrategies[user.role.toUpperCase()] ??
      ((currentUser: AuthUser) => this.homeDataRepository.getProjectBoardsByAccess(currentUser.cc));

    return strategy(user) as ReturnType<HomeRoleStrategy>;
  }
}
