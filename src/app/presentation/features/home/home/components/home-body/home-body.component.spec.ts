import { SimpleChange } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectRolePolicyService } from '@domain/policies/project-role-policy.service';
import { HomeAdminFacade } from '@presentation/features/home/home/components/sections/admin-section/home-admin.facade';
import { HomeProjectsFacade } from '@presentation/features/home/home/facades/home-projects.facade';
import { HomeBodyComponent } from '@presentation/features/home/home/components/home-body/home-body.component';

describe('HomeBodyComponent', () => {
  const routerMock = { navigate: jest.fn() };
  const homeAdminFacadeMock = {
    listUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const homeProjectsFacadeMock = {
    listProjects: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    filterProjects: jest.fn(),
    projectsFromPayload: jest.fn(),
  };

  const policyMock = {
    isScrum: jest.fn(),
    isPo: jest.fn(),
    canEditProjectHuSection: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    homeAdminFacadeMock.listUsers.mockReturnValue(of([]));
    homeAdminFacadeMock.createUser.mockReturnValue(of(null));
    homeAdminFacadeMock.updateUser.mockReturnValue(of(null));
    homeAdminFacadeMock.deleteUser.mockReturnValue(of(null));

    homeProjectsFacadeMock.listProjects.mockReturnValue(of([]));
    homeProjectsFacadeMock.createProject.mockReturnValue(of(null));
    homeProjectsFacadeMock.updateProject.mockReturnValue(of(null));
    homeProjectsFacadeMock.deleteProject.mockReturnValue(of(null));
    homeProjectsFacadeMock.filterProjects.mockImplementation((projects: unknown[]) => projects);
    homeProjectsFacadeMock.projectsFromPayload.mockReturnValue([]);

    policyMock.isScrum.mockReturnValue(false);
    policyMock.isPo.mockReturnValue(false);
    policyMock.canEditProjectHuSection.mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [HomeBodyComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: HomeAdminFacade, useValue: homeAdminFacadeMock },
        { provide: HomeProjectsFacade, useValue: homeProjectsFacadeMock },
        { provide: ProjectRolePolicyService, useValue: policyMock },
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(HomeBodyComponent);
    return fixture.componentInstance;
  }

  it('filters users by search term', () => {
    const component = createComponent();
    component.users = [{ cc: '1', email: 'a@a.com', userName: 'Alpha', role: 'DEV' } as never];
    component.searchTerm = 'alp';
    expect(component.filteredUsers).toHaveLength(1);
    component.searchTerm = '';
    expect(component.filteredUsers).toHaveLength(1);
  });

  it('delegates role getters to policy service', () => {
    const component = createComponent();
    component.role = 'SM';
    component.projects = [{ pro: 'P1' } as never];
    component.projectSearchTerm = 'x';
    expect(component.isScrum).toBe(false);
    expect(component.filteredProjects).toEqual([{ pro: 'P1' }]);
    expect(policyMock.isScrum).toHaveBeenCalledWith('SM');
    expect(component.isPo).toBe(false);
    expect(policyMock.isPo).toHaveBeenCalledWith('SM');
    expect(component.canEditProjectHu).toBe(true);
    expect(policyMock.canEditProjectHuSection).toHaveBeenCalledWith('SM');
    expect(homeProjectsFacadeMock.filterProjects).toHaveBeenCalled();
  });

  it('toggles section collapsed state', () => {
    const component = createComponent();
    expect(component.isSectionCollapsed('admin')).toBe(false);
    component.toggleSection('admin');
    expect(component.isSectionCollapsed('admin')).toBe(true);
  });

  it('loads users on admin changes and resets project state', () => {
    const component = createComponent();
    const loadUsersSpy = jest.spyOn(component, 'loadUsers');
    component.isAdmin = true;
    component.ngOnChanges({ isAdmin: new SimpleChange(false, true, false) });
    expect(loadUsersSpy).toHaveBeenCalled();
  });

  it('loads projects on non-admin role/payload changes', () => {
    const component = createComponent();
    const loadProjectsSpy = jest.spyOn(component, 'loadProjectsByRole').mockImplementation(() => {});
    component.isAdmin = false;
    component.ngOnChanges({ role: new SimpleChange('DEV', 'SM', false) });
    expect(loadProjectsSpy).toHaveBeenCalled();
  });

  it('loadUsers handles success and error', () => {
    const component = createComponent();
    component.isAdmin = true;

    homeAdminFacadeMock.listUsers.mockReturnValueOnce(of([{ cc: '1' }]));
    component.loadUsers();
    expect(component.users).toEqual([{ cc: '1' }]);

    homeAdminFacadeMock.listUsers.mockReturnValueOnce(throwError(() => new Error('x')));
    component.loadUsers();
    expect(component.adminError).toBe('No fue posible cargar usuarios.');
  });

  it('creates user success and error flows', () => {
    const component = createComponent();
    const loadUsersSpy = jest.spyOn(component, 'loadUsers').mockImplementation(() => {});
    component.createForm.setValue({
      cc: '123', email: 'a@a.com', userName: 'user', role: 'QA', password: '12345678',
    });

    component.createUser();
    expect(homeAdminFacadeMock.createUser).toHaveBeenCalled();
    expect(loadUsersSpy).toHaveBeenCalled();

    homeAdminFacadeMock.createUser.mockReturnValueOnce(throwError(() => new Error('x')));
    component.createForm.setValue({
      cc: '456', email: 'b@b.com', userName: 'user2', role: 'DEV', password: '12345678',
    });
    component.createUser();
    expect(component.adminError).toBe('No fue posible crear el usuario.');
  });

  it('handles edit user lifecycle', () => {
    const component = createComponent();
    const loadUsersSpy = jest.spyOn(component, 'loadUsers').mockImplementation(() => {});

    component.startEdit({ cc: '1', email: 'a@a.com', userName: 'u', role: 'QA' } as never);
    expect(component.editingCc).toBe('1');

    component.saveEdit();
    expect(homeAdminFacadeMock.updateUser).toHaveBeenCalled();
    expect(loadUsersSpy).toHaveBeenCalled();

    component.startEdit({ cc: '1', email: 'a@a.com', userName: 'u', role: 'QA' } as never);
    homeAdminFacadeMock.updateUser.mockReturnValueOnce(throwError(() => new Error('x')));
    component.saveEdit();
    expect(component.adminError).toBe('No fue posible editar el usuario.');

    component.cancelEdit();
    expect(component.editingCc).toBeNull();
  });

  it('deletes user with success and error', () => {
    const component = createComponent();
    const loadUsersSpy = jest.spyOn(component, 'loadUsers').mockImplementation(() => {});
    component.deleteUser('1');
    expect(homeAdminFacadeMock.deleteUser).toHaveBeenCalledWith('1');
    expect(loadUsersSpy).toHaveBeenCalled();

    homeAdminFacadeMock.deleteUser.mockReturnValueOnce(throwError(() => new Error('x')));
    component.deleteUser('1');
    expect(component.adminError).toBe('No fue posible eliminar el usuario.');
  });

  it('loads projects by role for scrum and non-scrum', () => {
    const component = createComponent();
    component.isAdmin = false;

    policyMock.isScrum.mockReturnValueOnce(false);
    homeProjectsFacadeMock.projectsFromPayload.mockReturnValueOnce([{ pro: 'P1', hu: [] }]);
    component.loadProjectsByRole();
    expect(component.projects).toEqual([{ pro: 'P1', hu: [] }]);

    policyMock.isScrum.mockReturnValue(true);
    component.role = 'SM';
    homeProjectsFacadeMock.listProjects.mockReturnValueOnce(of([{ pro: 'P2', hu: [] }]));
    component.loadProjectsByRole();
    expect(component.projects).toEqual([{ pro: 'P2', hu: [] }]);

    homeProjectsFacadeMock.listProjects.mockReturnValueOnce(throwError(() => new Error('x')));
    component.loadProjectsByRole();
    expect(component.scrumError).toBe('No fue posible cargar proyectos.');
  });

  it('creates project with validation and success/error flows', () => {
    const component = createComponent();
    const loadProjectsSpy = jest.spyOn(component, 'loadProjectsByRole').mockImplementation(() => {});

    component.createProject();
    expect(homeProjectsFacadeMock.createProject).not.toHaveBeenCalled();

    component.createProjectForm.controls.pro.setValue('P0');
    component.createProjectForm.controls.projectName.setValue('Proyecto');
    component.createAccessControls.at(0).setValue('123');
    component.createHuItemsControls.at(0).patchValue({ hu: '   ', descripcion: 'Desc', status: 'backlog' });
    component.createProject();
    expect(component.scrumError).toBe('Debes registrar al menos una HU válida.');

    component.createHuItemsControls.at(0).patchValue({ hu: 'HU0', descripcion: 'Desc', status: 'backlog' });
    while (component.createAccessControls.length > 0) {
      component.createAccessControls.removeAt(0);
    }
    component.createAccessControls.push(new FormControl('   ') as never);
    component.createProject();
    expect(component.scrumError).toBe('Debes registrar al menos una cédula de acceso.');

    component.createProjectForm.controls.pro.setValue('P1');
    component.createProjectForm.controls.projectName.setValue('Proyecto');
    component.createHuItemsControls.at(0).patchValue({ hu: 'HU1', descripcion: 'Desc', status: 'backlog' });
    component.createAccessControls.at(0).setValue('123');

    component.createProject();
    expect(homeProjectsFacadeMock.createProject).toHaveBeenCalled();
    expect(loadProjectsSpy).toHaveBeenCalled();

    homeProjectsFacadeMock.createProject.mockReturnValueOnce(throwError(() => new Error('x')));
    component.createProjectForm.controls.pro.setValue('P2');
    component.createProjectForm.controls.projectName.setValue('Proyecto 2');
    component.createHuItemsControls.at(0).patchValue({ hu: 'HU2', descripcion: 'Desc2', status: 'test' });
    component.createAccessControls.at(0).setValue('456');
    component.createProject();
    expect(component.scrumError).toBe('No fue posible crear el proyecto.');
  });

  it('edits project respecting role and validation', () => {
    const component = createComponent();
    const loadProjectsSpy = jest.spyOn(component, 'loadProjectsByRole').mockImplementation(() => {});
    component.projects = [{ pro: 'P1', projectName: 'X', accesos: ['1'], hu: [{ hu: 'HU1', descripcion: 'D', status: 'backlog' }] } as never];

    component.startEditProject(component.projects[0]);
    expect(component.editingProjectPro).toBe('P1');

    component.saveProject();
    expect(homeProjectsFacadeMock.updateProject).toHaveBeenCalled();
    expect(loadProjectsSpy).toHaveBeenCalled();

    component.startEditProject(component.projects[0]);
    homeProjectsFacadeMock.updateProject.mockReturnValueOnce(throwError(() => new Error('x')));
    component.saveProject();
    expect(component.scrumError).toBe('No fue posible editar el proyecto.');

    component.cancelEditProject();
    expect(component.editingProjectPro).toBeNull();
  });

  it('shows not found error when editing project key does not exist', () => {
    const component = createComponent();
    component.projects = [{ pro: 'P1', projectName: 'X', accesos: ['1'], hu: [{ hu: 'HU1', descripcion: 'D', status: 'backlog' }] } as never];
    component.startEditProject(component.projects[0]);
    component.editingProjectPro = 'NOPE';
    component.saveProject();
    expect(component.scrumError).toBe('No fue posible encontrar el proyecto a editar.');
  });

  it('blocks project edition when role cannot edit HU', () => {
    const component = createComponent();
    policyMock.canEditProjectHuSection.mockReturnValue(false);
    component.startEditProject({ pro: 'P1', projectName: 'X', hu: [], accesos: [] } as never);
    expect(component.editingProjectPro).toBeNull();
  });

  it('handles saveProject validation branches for invalid hu and accesses', () => {
    const component = createComponent();
    component.projects = [{ pro: 'P1', projectName: 'X', accesos: ['1'], hu: [{ hu: '1', descripcion: 'D', status: 'backlog' }] } as never];
    component.startEditProject(component.projects[0]);

    component.huItemsControls.at(0).patchValue({ hu: '   ', descripcion: 'D', status: 'backlog' });
    component.saveProject();
    expect(component.scrumError).toBe('Cada HU debe tener hu, descripción y status.');

    component.huItemsControls.at(0).patchValue({ hu: '1', descripcion: 'D', status: 'backlog' });
    while (component.editAccessControls.length > 0) {
      component.editAccessControls.removeAt(0);
    }
    component.editAccessControls.push(new FormControl('   ') as never);
    component.scrumError = '';
    component.saveProject();
    expect(component.scrumError).toBe('Debes registrar al menos un acceso.');
  });

  it('uses PO constraints when editing project', () => {
    const component = createComponent();
    policyMock.isPo.mockReturnValue(true);
    component.projects = [{ pro: 'P1', projectName: 'Original', accesos: ['99'], hu: [{ hu: '1', descripcion: 'D', status: 'backlog' }] } as never];
    component.startEditProject(component.projects[0]);
    component.editProjectForm.controls.projectName.setValue('Changed');
    component.saveProject();

    expect(homeProjectsFacadeMock.updateProject).toHaveBeenCalledWith(
      'P1',
      expect.objectContaining({
        projectName: 'Original',
        accesos: ['99'],
      }),
    );
  });

  it('deletes project and navigates to board', () => {
    const component = createComponent();
    component.role = 'SM';
    policyMock.isScrum.mockReturnValue(true);
    const loadProjectsSpy = jest.spyOn(component, 'loadProjectsByRole').mockImplementation(() => {});

    component.deleteProject('P1');
    expect(homeProjectsFacadeMock.deleteProject).toHaveBeenCalledWith('P1');
    expect(loadProjectsSpy).toHaveBeenCalled();

    homeProjectsFacadeMock.deleteProject.mockReturnValueOnce(throwError(() => new Error('x')));
    component.deleteProject('P1');
    expect(component.scrumError).toBe('No fue posible eliminar el proyecto.');

    component.viewProjectBoard('P1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/home/project-board', 'P1']);
  });

  it('handles add/remove helpers safely', () => {
    const component = createComponent();
    const initialHu = component.huItemsControls.length;
    component.addHuItem();
    expect(component.huItemsControls.length).toBe(initialHu + 1);
    component.removeHuItem(0);

    const initialCreateHu = component.createHuItemsControls.length;
    component.addCreateHuItem();
    expect(component.createHuItemsControls.length).toBe(initialCreateHu + 1);
    component.removeCreateHuItem(0);
    component.removeCreateHuItem(99);

    component.addCreateAccess();
    component.removeCreateAccess(0);
    component.removeCreateAccess(99);
    component.addEditAccess();
    component.removeEditAccess(0);
    component.removeEditAccess(99);
  });

  it('returns early when loadUsers is called for non-admin', () => {
    const component = createComponent();
    component.isAdmin = false;
    component.loadUsers();
    expect(homeAdminFacadeMock.listUsers).not.toHaveBeenCalled();
  });

  it('returns early for loadProjectsByRole when admin', () => {
    const component = createComponent();
    component.isAdmin = true;
    component.loadProjectsByRole();
    expect(homeProjectsFacadeMock.listProjects).not.toHaveBeenCalled();
  });
});
