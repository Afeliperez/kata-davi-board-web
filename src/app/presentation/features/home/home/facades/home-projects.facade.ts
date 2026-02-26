import { Injectable, inject } from '@angular/core';
import { ManageSmProjectsUseCase } from '../../../../../application/use-cases/home/manage-sm-projects.use-case';
import {
  CreateProjectCommand,
  HomePayload,
  ProjectBoardSummary,
  UpdateProjectCommand,
} from '../../../../../domain/ports/home-data-repository.port';

@Injectable({ providedIn: 'root' })
export class HomeProjectsFacade {
  private readonly manageSmProjectsUseCase = inject(ManageSmProjectsUseCase);

  listProjects() {
    return this.manageSmProjectsUseCase.listProjects();
  }

  createProject(payload: CreateProjectCommand) {
    return this.manageSmProjectsUseCase.createProject(payload);
  }

  updateProject(pro: string, payload: UpdateProjectCommand) {
    return this.manageSmProjectsUseCase.updateProject(pro, payload);
  }

  deleteProject(pro: string) {
    return this.manageSmProjectsUseCase.deleteProject(pro);
  }

  filterProjects(projects: ProjectBoardSummary[], searchTerm: string): ProjectBoardSummary[] {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return projects;
    }

    return projects.filter((project) => JSON.stringify(project).toLowerCase().includes(normalizedTerm));
  }

  projectsFromPayload(payload: HomePayload | { message: string } | null): ProjectBoardSummary[] {
    if (!payload || !('data' in payload)) {
      return [];
    }

    const rawProjects = payload.data;
    const projects = Array.isArray(rawProjects) ? rawProjects : [rawProjects];

    return projects.filter((project): project is ProjectBoardSummary => {
      return !!project && typeof project === 'object' && 'pro' in project && 'hu' in project;
    });
  }
}
