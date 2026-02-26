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
  projectSearchTerm = '';
  private readonly collapsedSections = new Map<string, boolean>();
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
    huItems: this.formBuilder.array([this.createHuGroup()], Validators.required),
    accesos: this.formBuilder.array([this.createAccessControl()], Validators.required),
  });

  readonly editProjectForm = this.formBuilder.nonNullable.group({
    projectName: ['', Validators.required],
    accesos: this.formBuilder.array([], Validators.required),
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

  get isPo(): boolean {
    return this.role.toUpperCase() === 'PO';
  }

  get canEditProjectHu(): boolean {
    return this.isScrum || this.isPo;
  }

  get shouldShowProjects(): boolean {
    return !this.isAdmin;
  }

  get filteredProjects(): ProjectBoardSummary[] {
    const normalizedTerm = this.projectSearchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return this.projects;
    }

    return this.projects.filter((project) => {
      const searchableContent = JSON.stringify(project).toLowerCase();
      return searchableContent.includes(normalizedTerm);
    });
  }

  get huItemsControls(): FormArray {
    return this.editProjectForm.controls.huItems as FormArray;
  }

  get createHuItemsControls(): FormArray {
    return this.createProjectForm.controls.huItems as FormArray;
  }

  get createAccessControls(): FormArray {
    return this.createProjectForm.controls.accesos as FormArray;
  }

  get editAccessControls(): FormArray {
    return this.editProjectForm.controls.accesos as FormArray;
  }

  isSectionCollapsed(sectionKey: string): boolean {
    return this.collapsedSections.get(sectionKey) ?? false;
  }

  toggleSection(sectionKey: string): void {
    const collapsed = this.isSectionCollapsed(sectionKey);
    this.collapsedSections.set(sectionKey, !collapsed);
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

    const hu = this.createHuItemsControls.controls.map((control) => {
      const huControl = control as FormGroup;
      const value = huControl.getRawValue() as HuItem;
      return {
        hu: value.hu.trim(),
        descripcion: value.descripcion.trim(),
        status: value.status.trim(),
      };
    });

    const hasInvalidHu = hu.some((item) => !item.hu || !item.descripcion || !item.status);

    if (hasInvalidHu || hu.length === 0) {
      this.scrumError = 'Debes registrar al menos una HU válida.';
      return;
    }

    const accesos = this.createAccessControls.controls
      .map((control) => String(control.value).trim())
      .filter((value) => value.length > 0);

    if (accesos.length === 0) {
      this.scrumError = 'Debes registrar al menos una cédula de acceso.';
      return;
    }

    this.scrumError = '';

    this.manageSmProjectsUseCase
      .createProject({
        pro: this.createProjectForm.controls.pro.value,
        projectName: this.createProjectForm.controls.projectName.value,
        hu,
        accesos,
      })
      .subscribe({
        next: () => {
          this.createProjectForm.reset({
            pro: '',
            projectName: '',
            huItems: [],
            accesos: [],
          });
          this.clearCreateHuItems();
          this.clearCreateAccessItems();
          this.addCreateHuItem();
          this.addCreateAccess();
          this.loadProjectsByRole();
        },
        error: () => {
          this.scrumError = 'No fue posible crear el proyecto.';
        },
      });
  }

  startEditProject(project: ProjectBoardSummary): void {
    if (!this.canEditProjectHu) {
      return;
    }

    this.editingProjectPro = project.pro;
    this.editProjectForm.setValue({
      projectName: project.projectName,
      accesos: [],
      huItems: [],
    });
    this.setHuItems(project.hu);
    this.setEditAccessItems(project.accesos);
  }

  cancelEditProject(): void {
    this.editingProjectPro = null;
    this.editProjectForm.reset({
      projectName: '',
      accesos: [],
      huItems: [],
    });
    this.clearHuItems();
    this.clearEditAccessItems();
  }

  saveProject(): void {
    if (!this.canEditProjectHu || !this.editingProjectPro || this.editProjectForm.invalid) {
      this.editProjectForm.markAllAsTouched();
      return;
    }

    const editingProject = this.projects.find((project) => project.pro === this.editingProjectPro);

    if (!editingProject) {
      this.scrumError = 'No fue posible encontrar el proyecto a editar.';
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

    const accesos = this.isPo
      ? editingProject.accesos
      : this.editAccessControls.controls
        .map((control) => String(control.value).trim())
        .filter((value) => value.length > 0);

    if (!this.isPo && accesos.length === 0) {
      this.scrumError = 'Debes registrar al menos un acceso.';
      return;
    }

    const projectName = this.isPo
      ? editingProject.projectName
      : this.editProjectForm.controls.projectName.value;

    this.scrumError = '';

    this.manageSmProjectsUseCase
      .updateProject(this.editingProjectPro, {
        projectName,
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

  addCreateHuItem(): void {
    this.createHuItemsControls.push(this.createHuGroup());
  }

  removeHuItem(index: number): void {
    if (index < 0 || index >= this.huItemsControls.length) {
      return;
    }

    this.huItemsControls.removeAt(index);
  }

  removeCreateHuItem(index: number): void {
    if (index < 0 || index >= this.createHuItemsControls.length || this.createHuItemsControls.length === 1) {
      return;
    }

    this.createHuItemsControls.removeAt(index);
  }

  addCreateAccess(): void {
    this.createAccessControls.push(this.createAccessControl());
  }

  removeCreateAccess(index: number): void {
    if (index < 0 || index >= this.createAccessControls.length || this.createAccessControls.length === 1) {
      return;
    }

    this.createAccessControls.removeAt(index);
  }

  addEditAccess(): void {
    this.editAccessControls.push(this.createAccessControl());
  }

  removeEditAccess(index: number): void {
    if (index < 0 || index >= this.editAccessControls.length || this.editAccessControls.length === 1) {
      return;
    }

    this.editAccessControls.removeAt(index);
  }

  viewProjectBoard(projectPro: string): void {
    this.router.navigate(['/home/project-board', projectPro]);
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

  private clearCreateHuItems(): void {
    while (this.createHuItemsControls.length > 0) {
      this.createHuItemsControls.removeAt(0);
    }
  }

  private clearCreateAccessItems(): void {
    while (this.createAccessControls.length > 0) {
      this.createAccessControls.removeAt(0);
    }
  }

  private clearEditAccessItems(): void {
    while (this.editAccessControls.length > 0) {
      this.editAccessControls.removeAt(0);
    }
  }

  private setEditAccessItems(accessItems: string[]): void {
    this.clearEditAccessItems();

    accessItems.forEach((access) => {
      this.editAccessControls.push(this.createAccessControl(access));
    });

    if (this.editAccessControls.length === 0) {
      this.editAccessControls.push(this.createAccessControl());
    }
  }

  private createHuGroup(item?: HuItem): FormGroup {
    return this.formBuilder.nonNullable.group({
      hu: [item?.hu ?? '', Validators.required],
      descripcion: [item?.descripcion ?? '', Validators.required],
      status: [item?.status ?? 'backlog', Validators.required],
    });
  }

  private createAccessControl(value = '') {
    return this.formBuilder.nonNullable.control(value, [
      Validators.required,
      Validators.pattern('^[0-9]+$'),
    ]);
  }

}
