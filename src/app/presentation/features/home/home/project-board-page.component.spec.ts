import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { GetHomeDataUseCase } from '@application/use-cases/home/get-home-data.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { ManageSmProjectsUseCase } from '@application/use-cases/home/manage-sm-projects.use-case';
import { ProjectRolePolicyService } from '@domain/policies/project-role-policy.service';
import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';
import { ProjectBoardPageComponent } from '@presentation/features/home/home/project-board-page.component';

describe('ProjectBoardPageComponent', () => {
  type SessionUser = { cc: string; userName: string; role: string };
  const routerMock = { navigate: jest.fn() };
  const routeMock = {
    snapshot: {
      paramMap: {
        get: jest.fn(),
      },
    },
  };

  const user$ = new BehaviorSubject<SessionUser | null>(null);
  const authSessionMock = { user$: user$.asObservable() };
  const getHomeDataUseCaseMock = { execute: jest.fn() };
  const logoutUseCaseMock = { execute: jest.fn() };
  const manageSmProjectsUseCaseMock = {
    listProjects: jest.fn(),
    updateProject: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    user$.next(null);
    routeMock.snapshot.paramMap.get.mockReturnValue('P1');
    manageSmProjectsUseCaseMock.updateProject.mockReturnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [ProjectBoardPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthSessionService, useValue: authSessionMock },
        { provide: GetHomeDataUseCase, useValue: getHomeDataUseCaseMock },
        { provide: LogoutUseCase, useValue: logoutUseCaseMock },
        { provide: ManageSmProjectsUseCase, useValue: manageSmProjectsUseCaseMock },
        ProjectRolePolicyService,
      ],
    }).compileComponents();
  });

  it('shows invalid project error when route param is missing', () => {
    routeMock.snapshot.paramMap.get.mockReturnValue(null);
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();
    expect(component.error).toBe('Proyecto no válido.');
  });

  it('navigates to login if user is missing', () => {
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('loads scrum project list for scrum role', () => {
    user$.next({ cc: '1', userName: 'SM', role: 'SM' });
    manageSmProjectsUseCaseMock.listProjects.mockReturnValue(
      of([{ pro: 'P1', projectName: 'X', hu: [], accesos: [] }]),
    );

    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.isScrum).toBe(true);
    expect(component.project?.pro).toBe('P1');
  });

  it('handles scrum project loading error', () => {
    user$.next({ cc: '1', userName: 'SM', role: 'SM' });
    manageSmProjectsUseCaseMock.listProjects.mockReturnValue(throwError(() => new Error('down')));

    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.error).toBe('No fue posible cargar el tablero del proyecto.');
  });

  it('loads access projects for non-scrum role', () => {
    user$.next({ cc: '9', userName: 'Dev', role: 'DEV' });
    getHomeDataUseCaseMock.execute.mockReturnValue(
      of({
        endpoint: '/x',
        data: {
          data: [{ pro: 'P1', projectName: 'X', hu: [], accesos: [] }, { foo: 'bar' }],
        },
      }),
    );

    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.isScrum).toBe(false);
    expect(component.project?.pro).toBe('P1');
  });

  it('handles access project loading error', () => {
    user$.next({ cc: '9', userName: 'Dev', role: 'DEV' });
    getHomeDataUseCaseMock.execute.mockReturnValue(throwError(() => new Error('down')));
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();
    expect(component.error).toBe('No fue posible cargar el tablero del proyecto.');
  });

  it('moves HU and calls update project', () => {
    user$.next({ cc: '1', userName: 'SM', role: 'SM' });
    manageSmProjectsUseCaseMock.listProjects.mockReturnValue(
      of([
        {
          pro: 'P1',
          projectName: 'X',
          accesos: [],
          hu: [
            { hu: '1', descripcion: 'A', status: 'backlog' },
            { hu: '2', descripcion: 'B', status: 'test' },
          ],
        },
      ]),
    );
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    component.onHuMoved({
      item: { hu: '1', descripcion: 'A', status: 'backlog' },
      fromStatus: 'backlog',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
    });

    expect(manageSmProjectsUseCaseMock.updateProject).toHaveBeenCalled();
  });

  it('restores previous HU list when update fails', () => {
    user$.next({ cc: '1', userName: 'SM', role: 'SM' });
    manageSmProjectsUseCaseMock.listProjects.mockReturnValue(
      of([
        {
          pro: 'P1',
          projectName: 'X',
          accesos: [],
          hu: [{ hu: '1', descripcion: 'A', status: 'backlog' }],
        },
      ]),
    );
    manageSmProjectsUseCaseMock.updateProject.mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    component.onHuMoved({
      item: { hu: '1', descripcion: 'A', status: 'backlog' },
      fromStatus: 'backlog',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
    });

    expect(component.error).toBe('No fue posible actualizar el estado de la HU.');
  });

  it('navigates with goBack and logout', () => {
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.goBack();
    component.logout();

    expect(logoutUseCaseMock.execute).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not move HU when preconditions are not met', () => {
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;

    component.onHuMoved({
      item: { hu: '1', descripcion: 'A', status: 'backlog' },
      fromStatus: 'backlog',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
    });
    expect(manageSmProjectsUseCaseMock.updateProject).not.toHaveBeenCalled();
  });

  it('does not update when moving to same status or item not found', () => {
    user$.next({ cc: '1', userName: 'SM', role: 'SM' });
    manageSmProjectsUseCaseMock.listProjects.mockReturnValue(
      of([{ pro: 'P1', projectName: 'X', accesos: [], hu: [{ hu: '1', descripcion: 'A', status: 'backlog' }] }]),
    );
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    component.onHuMoved({
      item: { hu: '1', descripcion: 'A', status: 'backlog' },
      fromStatus: 'backlog',
      toStatus: 'backlog',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: true,
    });

    component.onHuMoved({
      item: { hu: 'X', descripcion: 'Z', status: 'backlog' },
      fromStatus: 'backlog',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
    });

    expect(manageSmProjectsUseCaseMock.updateProject).not.toHaveBeenCalled();
  });

  it('sets error when selected project is missing', () => {
    user$.next({ cc: '1', userName: 'SM', role: 'SM' });
    manageSmProjectsUseCaseMock.listProjects.mockReturnValue(of([{ pro: 'P2', projectName: 'X', accesos: [], hu: [] }]));
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();
    expect(component.error).toBe('No tienes acceso a este proyecto o no existe.');
  });

  it('does not move HU when user role cannot edit board', () => {
    user$.next({ cc: '9', userName: 'Guest', role: 'VIEWER' });
    getHomeDataUseCaseMock.execute.mockReturnValue(
      of({
        endpoint: '/x',
        data: {
          data: [{ pro: 'P1', projectName: 'X', hu: [{ hu: '1', descripcion: 'A', status: 'backlog' }], accesos: [] }],
        },
      }),
    );

    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    component.onHuMoved({
      item: { hu: '1', descripcion: 'A', status: 'backlog' },
      fromStatus: 'backlog',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
    });

    expect(component.canEditBoard).toBe(false);
    expect(manageSmProjectsUseCaseMock.updateProject).not.toHaveBeenCalled();
  });

  it('updates with fallback item match when from status differs by format', () => {
    user$.next({ cc: '1', userName: 'SM', role: 'SM' });
    manageSmProjectsUseCaseMock.listProjects.mockReturnValue(
      of([
        {
          pro: 'P1',
          projectName: 'X',
          accesos: [],
          hu: [
            { hu: '1', descripcion: 'A', status: 'en_curso' },
            { hu: '2', descripcion: 'B', status: 'test' },
          ],
        },
      ]),
    );
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    component.onHuMoved({
      item: { hu: '1', descripcion: 'A', status: 'en curso' },
      fromStatus: 'en curso',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 99,
      sameColumn: false,
    });

    expect(manageSmProjectsUseCaseMock.updateProject).toHaveBeenCalled();
  });

  it('covers move helper boundary branches', () => {
    const fixture = TestBed.createComponent(ProjectBoardPageComponent);
    const component = fixture.componentInstance as unknown as {
      getUpdatedHuForMove: (
        currentHu: Array<{ hu: string; descripcion: string; status: string }>,
        targetIndex: number,
        event: {
          item: { hu: string; descripcion: string; status: string };
          fromStatus: string;
          toStatus: string;
          previousIndex: number;
          currentIndex: number;
          sameColumn: boolean;
        },
      ) => Array<{ hu: string; descripcion: string; status: string }> | null;
    };

    const base = [
      { hu: '1', descripcion: 'A', status: 'backlog' },
      { hu: '2', descripcion: 'B', status: 'test' },
      { hu: '3', descripcion: 'C', status: 'test' },
    ];

    const toStart = component.getUpdatedHuForMove(base, 0, {
      item: base[0],
      fromStatus: 'backlog',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
    });
    expect(toStart?.[0].hu).toBe('1');

    const toEnd = component.getUpdatedHuForMove(base, 0, {
      item: base[0],
      fromStatus: 'backlog',
      toStatus: 'test',
      previousIndex: 0,
      currentIndex: 10,
      sameColumn: false,
    });
    expect(toEnd?.[toEnd.length - 1].hu).toBe('1');

    const toMiddle = component.getUpdatedHuForMove(
      [
        { hu: '1', descripcion: 'A', status: 'backlog' },
        { hu: '2', descripcion: 'B', status: 'test' },
        { hu: '3', descripcion: 'C', status: 'test' },
        { hu: '4', descripcion: 'D', status: 'test' },
      ],
      0,
      {
        item: { hu: '1', descripcion: 'A', status: 'backlog' },
        fromStatus: 'backlog',
        toStatus: 'test',
        previousIndex: 0,
        currentIndex: 1,
        sameColumn: false,
      },
    );
    expect(toMiddle?.[1].hu).toBe('1');

    const invalidMove = component.getUpdatedHuForMove(base, 0, {
      item: base[0],
      fromStatus: 'backlog',
      toStatus: 'backlog',
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: true,
    });
    expect(invalidMove).toBeNull();
  });
});
