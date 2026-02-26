import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { GetHomeDataUseCase } from '@application/use-cases/home/get-home-data.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { ManageSmProjectsUseCase } from '@application/use-cases/home/manage-sm-projects.use-case';
import { AuthUser } from '@domain/ports/auth-repository.port';
import { HuItem, ProjectBoardSummary } from '@domain/ports/home-data-repository.port';
import { ProjectRolePolicyService } from '@domain/policies/project-role-policy.service';
import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';
import { ScrumProjectBoardComponent } from './components/scrum-project-board/scrum-project-board.component';
import { HomeFooterComponent } from './components/home-footer/home-footer.component';

@Component({
  selector: 'app-project-board-page',
  standalone: true,
  imports: [CommonModule, ScrumProjectBoardComponent, HomeFooterComponent],
  templateUrl: './project-board-page.component.html',
  styleUrl: './project-board-page.component.scss',
})
export class ProjectBoardPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly getHomeDataUseCase = inject(GetHomeDataUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly manageSmProjectsUseCase = inject(ManageSmProjectsUseCase);
  private readonly projectRolePolicy = inject(ProjectRolePolicyService);

  isLoading = false;
  error = '';
  currentUserName = '';
  currentUserRole = '';
  isScrum = false;
  currentPro = '';
  project: ProjectBoardSummary | null = null;
  private projects: ProjectBoardSummary[] = [];

  ngOnInit(): void {
    this.currentPro = this.route.snapshot.paramMap.get('pro') ?? '';

    if (!this.currentPro) {
      this.error = 'Proyecto no válido.';
      return;
    }

    this.loadProjectByRole();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.logoutUseCase.execute();
    this.router.navigate(['/login']);
  }

  onHuMoved(event: {
    item: HuItem;
    fromStatus: string;
    toStatus: string;
    previousIndex: number;
    currentIndex: number;
    sameColumn: boolean;
  }): void {
    if (!this.project || !this.canEditBoard) {
      return;
    }

    if (this.normalizeStatus(event.fromStatus) === this.normalizeStatus(event.toStatus)) {
      return;
    }

    const previousHu = [...this.project.hu];

    let targetIndex = this.project.hu.findIndex(
      (hu) =>
        hu.hu === event.item.hu &&
        hu.descripcion === event.item.descripcion &&
        this.normalizeStatus(hu.status) === this.normalizeStatus(event.fromStatus),
    );

    if (targetIndex < 0) {
      targetIndex = this.project.hu.findIndex(
        (hu) => hu.hu === event.item.hu && hu.descripcion === event.item.descripcion,
      );
    }

    if (targetIndex < 0) {
      return;
    }

    const updatedHu = this.getUpdatedHuForMove(this.project.hu, targetIndex, event);

    if (!updatedHu) {
      return;
    }

    this.error = '';
    this.project = { ...this.project, hu: updatedHu };

    this.manageSmProjectsUseCase
      .updateProject(this.project.pro, {
        projectName: this.project.projectName,
        hu: updatedHu,
        accesos: this.project.accesos,
      })
      .subscribe({
        next: () => {},
        error: () => {
          if (this.project) {
            this.project = { ...this.project, hu: previousHu };
          }
          this.error = 'No fue posible actualizar el estado de la HU.';
        },
      });
  }

  private loadProjectByRole(): void {
    this.authSessionService.user$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.currentUserName = user.userName;
      this.currentUserRole = user.role.toUpperCase();
      this.isScrum = this.projectRolePolicy.isScrum(user.role);

      if (this.isScrum) {
        this.loadSmProject();
        return;
      }

      this.loadAccessProject(user);
    });
  }

  private loadSmProject(): void {
    this.isLoading = true;
    this.error = '';

    this.manageSmProjectsUseCase
      .listProjects()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (projects) => {
          this.projects = projects;
          this.selectProject();
        },
        error: () => {
          this.error = 'No fue posible cargar el tablero del proyecto.';
        },
      });
  }

  private loadAccessProject(user: AuthUser): void {
    this.isLoading = true;
    this.error = '';

    this.getHomeDataUseCase
      .execute(user)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          const rawData = result.data.data;
          const projects = Array.isArray(rawData) ? rawData : [rawData];

          this.projects = projects.filter((project): project is ProjectBoardSummary => {
            return !!project && typeof project === 'object' && 'pro' in project && 'hu' in project;
          });

          this.selectProject();
        },
        error: () => {
          this.error = 'No fue posible cargar el tablero del proyecto.';
        },
      });
  }

  private selectProject(): void {
    this.project = this.projects.find((project) => project.pro === this.currentPro) ?? null;

    if (!this.project) {
      this.error = 'No tienes acceso a este proyecto o no existe.';
    }
  }

  get canEditBoard(): boolean {
    return this.projectRolePolicy.canEditBoard(this.currentUserRole);
  }

  private getUpdatedHuForMove(
    currentHu: HuItem[],
    targetIndex: number,
    event: {
      item: HuItem;
      fromStatus: string;
      toStatus: string;
      previousIndex: number;
      currentIndex: number;
      sameColumn: boolean;
    },
  ): HuItem[] | null {
    const fromStatus = this.normalizeStatus(event.fromStatus);
    const toStatus = this.normalizeStatus(event.toStatus);

    if (fromStatus === toStatus || event.currentIndex < 0) {
      return null;
    }

    const updatedHu = [...currentHu];
    const [movedItem] = updatedHu.splice(targetIndex, 1);

    if (!movedItem) {
      return null;
    }

    const movedWithUpdatedStatus: HuItem = {
      ...movedItem,
      status: event.toStatus,
    };

    const destinationIndexes = updatedHu
      .map((item, index) => ({ item, index }))
      .filter((entry) => this.normalizeStatus(entry.item.status) === toStatus)
      .map((entry) => entry.index);

    let insertionIndex = updatedHu.length;

    if (destinationIndexes.length > 0) {
      if (event.currentIndex <= 0) {
        insertionIndex = destinationIndexes[0];
      } else if (event.currentIndex >= destinationIndexes.length) {
        insertionIndex = destinationIndexes[destinationIndexes.length - 1] + 1;
      } else {
        insertionIndex = destinationIndexes[event.currentIndex];
      }
    }

    updatedHu.splice(insertionIndex, 0, movedWithUpdatedStatus);

    return updatedHu;
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
