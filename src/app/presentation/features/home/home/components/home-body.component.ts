import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ManageAdminUsersUseCase } from '../../../../../application/use-cases/home/manage-admin-users.use-case';
import { ManageSmProjectsUseCase } from '../../../../../application/use-cases/home/manage-sm-projects.use-case';
import {
  HomePayload,
  HuItem,
  ProjectBoardSummary,
  UserSummary,
} from '../../../../../domain/ports/home-data-repository.port';

@Component({
  selector: 'app-home-body',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './home-body.component.html',
  styleUrl: './home-body.component.scss',
})
export class HomeBodyComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly manageAdminUsersUseCase = inject(ManageAdminUsersUseCase);
  private readonly manageSmProjectsUseCase = inject(ManageSmProjectsUseCase);

  @Input() role = '';
  @Input() isAdmin = false;
  @Input() isLoading = false;
  @Input() endpointUsed = '';
  @Input() payload: HomePayload | { message: string } | null = null;
  @Input() searchTerm = '';

  users: UserSummary[] = [];
  adminError = '';
  isLoadingUsers = false;
  editingCc: string | null = null;
  projects: ProjectBoardSummary[] = [];
  scrumError = '';
  isLoadingProjects = false;
  editingProjectPro: string | null = null;
  readonly projectStatuses = [
    'backlog',
    'por_hacer',
    'en_curso',
    'test',
    'validacion_po',
    'finalizado',
  ];

  readonly createForm = this.formBuilder.nonNullable.group({
    cc: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    email: ['', [Validators.required, Validators.email]],
    userName: ['', Validators.required],
    role: ['QA', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly editForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    userName: ['', Validators.required],
    role: ['QA', Validators.required],
  });

  readonly createProjectForm = this.formBuilder.nonNullable.group({
    pro: ['', Validators.required],
    projectName: ['', Validators.required],
    huJson: [
      '[\n  {\n    "hu": "hola2",\n    "descripcion": "test2",\n    "status": "backlog"\n  }\n]',
      Validators.required,
    ],
    accesosCsv: ['121345,454782,99999', Validators.required],
  });

  readonly editProjectForm = this.formBuilder.nonNullable.group({
    projectName: ['', Validators.required],
    accesosCsv: ['', Validators.required],
    huItems: this.formBuilder.array([]),
  });

  get filteredUsers(): UserSummary[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return this.users;
    }

    return this.users.filter((user) =>
      Object.values(user)
        .map((value) => String(value).toLowerCase())
        .some((value) => value.includes(normalizedTerm)),
    );
  }

  get isScrum(): boolean {
    return this.role.toUpperCase() === 'SM' || this.role.toUpperCase() === 'SCRUM';
  }

  get shouldShowProjects(): boolean {
    return !this.isAdmin;
  }

  get huItemsControls(): FormArray {
    return this.editProjectForm.controls.huItems as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isAdmin && (changes['isAdmin'] || changes['role'])) {
      this.loadUsers();
    }

    if (!this.isAdmin && (changes['role'] || changes['payload'])) {
      this.loadProjectsByRole();
    }

    if (!this.isAdmin) {
      this.users = [];
      this.adminError = '';
      this.isLoadingUsers = false;
      this.editingCc = null;
    }

    if (!this.shouldShowProjects) {
      this.projects = [];
      this.scrumError = '';
      this.isLoadingProjects = false;
      this.editingProjectPro = null;
      this.clearHuItems();
    }
  }

  loadUsers(): void {
    if (!this.isAdmin) {
      return;
    }

    this.adminError = '';
    this.isLoadingUsers = true;

    this.manageAdminUsersUseCase.listUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.adminError = 'No fue posible cargar usuarios.';
        this.isLoadingUsers = false;
      },
    });
  }

  createUser(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.adminError = '';

    this.manageAdminUsersUseCase.createUser(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.createForm.reset({
          cc: '',
          email: '',
          userName: '',
          role: 'QA',
          password: '',
        });
        this.loadUsers();
      },
      error: () => {
        this.adminError = 'No fue posible crear el usuario.';
      },
    });
  }

  startEdit(user: UserSummary): void {
    this.editingCc = user.cc;
    this.editForm.setValue({
      email: user.email,
      userName: user.userName,
      role: user.role,
    });
  }

  cancelEdit(): void {
    this.editingCc = null;
    this.editForm.reset({
      email: '',
      userName: '',
      role: 'QA',
    });
  }

  saveEdit(): void {
    if (!this.editingCc || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.adminError = '';

    this.manageAdminUsersUseCase.updateUser(this.editingCc, this.editForm.getRawValue()).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadUsers();
      },
      error: () => {
        this.adminError = 'No fue posible editar el usuario.';
      },
    });
  }

  deleteUser(cc: string): void {
    this.adminError = '';

    this.manageAdminUsersUseCase.deleteUser(cc).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: () => {
        this.adminError = 'No fue posible eliminar el usuario.';
      },
    });
  }

  loadProjectsByRole(): void {
    if (this.isAdmin) {
      return;
    }

    if (!this.isScrum) {
      this.hydrateProjectsFromPayload();
      return;
    }

    this.scrumError = '';
    this.isLoadingProjects = true;

    this.manageSmProjectsUseCase.listProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoadingProjects = false;

        if (this.editingProjectPro && !projects.some((project) => project.pro === this.editingProjectPro)) {
          this.cancelEditProject();
        }
      },
      error: () => {
        this.scrumError = 'No fue posible cargar proyectos.';
        this.isLoadingProjects = false;
      },
    });
  }

  createProject(): void {
    if (this.createProjectForm.invalid) {
      this.createProjectForm.markAllAsTouched();
      return;
    }

    const parsed = this.parseProjectFields(
      this.createProjectForm.controls.huJson.value,
      this.createProjectForm.controls.accesosCsv.value,
    );

    if (!parsed) {
      this.scrumError = 'HU o accesos con formato inválido.';
      return;
    }

    this.scrumError = '';

    this.manageSmProjectsUseCase
      .createProject({
        pro: this.createProjectForm.controls.pro.value,
        projectName: this.createProjectForm.controls.projectName.value,
        hu: parsed.hu,
        accesos: parsed.accesos,
      })
      .subscribe({
        next: () => {
          this.createProjectForm.reset({
            pro: '',
            projectName: '',
            huJson:
              '[\n  {\n    "hu": "hola2",\n    "descripcion": "test2",\n    "status": "backlog"\n  }\n]',
            accesosCsv: '121345,454782,99999',
          });
          this.loadProjectsByRole();
        },
        error: () => {
          this.scrumError = 'No fue posible crear el proyecto.';
        },
      });
  }

  startEditProject(project: ProjectBoardSummary): void {
    if (!this.isScrum) {
      return;
    }

    this.editingProjectPro = project.pro;
    this.editProjectForm.setValue({
      projectName: project.projectName,
      accesosCsv: project.accesos.join(','),
      huItems: [],
    });
    this.setHuItems(project.hu);
  }

  cancelEditProject(): void {
    this.editingProjectPro = null;
    this.editProjectForm.reset({
      projectName: '',
      accesosCsv: '',
      huItems: [],
    });
    this.clearHuItems();
  }

  saveProject(): void {
    if (!this.isScrum || !this.editingProjectPro || this.editProjectForm.invalid) {
      this.editProjectForm.markAllAsTouched();
      return;
    }

    const hu = this.huItemsControls.controls.map((control) => {
      const huControl = control as FormGroup;
      const value = huControl.getRawValue() as HuItem;
      return {
        hu: value.hu.trim(),
        descripcion: value.descripcion.trim(),
        status: value.status.trim(),
      };
    });

    const hasInvalidHu = hu.some(
      (item) => !item.hu || !item.descripcion || !item.status,
    );

    if (hasInvalidHu) {
      this.scrumError = 'Cada HU debe tener hu, descripción y status.';
      return;
    }

    const accesos = this.editProjectForm.controls.accesosCsv.value
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (accesos.length === 0) {
      this.scrumError = 'Debes registrar al menos un acceso.';
      return;
    }

    this.scrumError = '';

    this.manageSmProjectsUseCase
      .updateProject(this.editingProjectPro, {
        projectName: this.editProjectForm.controls.projectName.value,
        hu,
        accesos,
      })
      .subscribe({
        next: () => {
          this.cancelEditProject();
          this.loadProjectsByRole();
        },
        error: () => {
          this.scrumError = 'No fue posible editar el proyecto.';
        },
      });
  }

  deleteProject(pro: string): void {
    if (!this.isScrum) {
      return;
    }

    this.scrumError = '';

    this.manageSmProjectsUseCase.deleteProject(pro).subscribe({
      next: () => {
        this.loadProjectsByRole();
      },
      error: () => {
        this.scrumError = 'No fue posible eliminar el proyecto.';
      },
    });
  }

  addHuItem(): void {
    this.huItemsControls.push(this.createHuGroup());
  }

  removeHuItem(index: number): void {
    if (index < 0 || index >= this.huItemsControls.length) {
      return;
    }

    this.huItemsControls.removeAt(index);
  }

  viewProjectBoard(projectPro: string): void {
    this.router.navigate(['/home/project-board', projectPro]);
  }

  private parseProjectFields(
    huJson: string,
    accesosCsv: string,
  ): { hu: HuItem[]; accesos: string[] } | null {
    try {
      const parsedHu = JSON.parse(huJson) as HuItem[];

      if (!Array.isArray(parsedHu)) {
        return null;
      }

      const validHu = parsedHu.every(
        (item) =>
          typeof item.hu === 'string' &&
          typeof item.descripcion === 'string' &&
          typeof item.status === 'string',
      );

      if (!validHu) {
        return null;
      }

      const accesos = accesosCsv
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      return { hu: parsedHu, accesos };
    } catch {
      return null;
    }
  }

  private hydrateProjectsFromPayload(): void {
    this.scrumError = '';

    if (!this.payload || !('data' in this.payload)) {
      this.projects = [];
      this.isLoadingProjects = this.isLoading;
      return;
    }

    const rawProjects = this.payload.data;
    const projects = Array.isArray(rawProjects) ? rawProjects : [rawProjects];

    this.projects = projects.filter((project): project is ProjectBoardSummary => {
      return !!project && typeof project === 'object' && 'pro' in project && 'hu' in project;
    });

    this.isLoadingProjects = this.isLoading;
  }

  private setHuItems(huItems: HuItem[]): void {
    this.clearHuItems();
    huItems.forEach((item) => this.huItemsControls.push(this.createHuGroup(item)));
  }

  private clearHuItems(): void {
    while (this.huItemsControls.length > 0) {
      this.huItemsControls.removeAt(0);
    }
  }

  private createHuGroup(item?: HuItem): FormGroup {
    return this.formBuilder.nonNullable.group({
      hu: [item?.hu ?? '', Validators.required],
      descripcion: [item?.descripcion ?? '', Validators.required],
      status: [item?.status ?? 'backlog', Validators.required],
    });
  }

}
