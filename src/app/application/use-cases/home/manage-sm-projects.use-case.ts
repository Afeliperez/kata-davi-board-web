import { inject, Injectable } from '@angular/core';
import {
  CreateProjectCommand,
  HOME_DATA_REPOSITORY,
  HomeDataRepositoryPort,
  ProjectBoardSummary,
  UpdateProjectCommand,
} from '../../../domain/ports/home-data-repository.port';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ManageSmProjectsUseCase {
  private readonly homeDataRepository = inject(HOME_DATA_REPOSITORY) as HomeDataRepositoryPort;

  listProjects() {
    return this.homeDataRepository.getProjectBoards().pipe(
      map((result) => {
        const projects = result.data.data;
        return Array.isArray(projects) ? projects : [projects];
      }),
    );
  }

  createProject(payload: CreateProjectCommand) {
    return this.homeDataRepository.createProject(payload);
  }

  updateProject(pro: string, payload: UpdateProjectCommand) {
    return this.homeDataRepository.updateProject(pro, payload);
  }

  deleteProject(pro: string) {
    return this.homeDataRepository.deleteProject(pro);
  }

  buildColumns(project: ProjectBoardSummary | null) {
    const statusColumns = [
      { title: 'Backlog', statusValue: 'backlog', keys: ['backlog'] },
      { title: 'Por Hacer', statusValue: 'por_hacer', keys: ['por_hacer', 'todo'] },
      { title: 'En curso', statusValue: 'en_curso', keys: ['en_curso', 'in_progress'] },
      { title: 'Test', statusValue: 'test', keys: ['test', 'testing'] },
      { title: 'Validación PO', statusValue: 'validacion_po', keys: ['validacion_po', 'po'] },
      { title: 'Finalizado', statusValue: 'finalizado', keys: ['finalizado', 'done', 'finished'] },
    ];

    return statusColumns.map((column) => ({
      title: column.title,
      statusValue: column.statusValue,
      cards:
        project?.hu.filter((item) =>
          column.keys.includes(this.normalizeStatus(item.status)),
        ) ?? [],
    }));
  }

  private normalizeStatus(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '_');
  }
}
