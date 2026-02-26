import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { GetHomeDataUseCase } from '@application/use-cases/home/get-home-data.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';
import { HomeComponent } from '@presentation/features/home/home/home.component';

describe('HomeComponent', () => {
  type SessionUser = { cc: string; userName: string; role: string };
  const routerMock = { navigate: jest.fn() };
  const getHomeDataUseCaseMock = { execute: jest.fn() };
  const logoutUseCaseMock = { execute: jest.fn() };
  const user$ = new BehaviorSubject<SessionUser | null>(null);
  const authSessionMock = { user$: user$.asObservable() };

  beforeEach(async () => {
    jest.clearAllMocks();
    user$.next(null);

    TestBed.overrideComponent(HomeComponent, {
      set: {
        template: '<div></div>',
      },
    });

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: GetHomeDataUseCase, useValue: getHomeDataUseCaseMock },
        { provide: LogoutUseCase, useValue: logoutUseCaseMock },
        { provide: AuthSessionService, useValue: authSessionMock },
      ],
    }).compileComponents();
  });

  it('logs out and resets state when no user session exists', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    expect(logoutUseCaseMock.execute).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.payload).toBeNull();
    expect(component.userRole).toBe('');
  });

  it('skips data fetch for ADMIN role', () => {
    user$.next({ cc: '1', userName: 'Admin', role: 'ADMIN' });
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.ngOnInit();

    expect(component.userRole).toBe('ADMIN');
    expect(getHomeDataUseCaseMock.execute).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('loads data for non-admin role successfully', () => {
    user$.next({ cc: '22', userName: 'Dev', role: 'DEV' });
    getHomeDataUseCaseMock.execute.mockReturnValue(of({ endpoint: '/x', data: { data: [] } }));

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    expect(getHomeDataUseCaseMock.execute).toHaveBeenCalled();
    expect(component.endpointUsed).toBe('/x');
    expect(component.payload).toEqual({ data: [] });
    expect(component.isLoading).toBe(false);
  });

  it('handles service error when loading data', () => {
    user$.next({ cc: '22', userName: 'Dev', role: 'DEV' });
    getHomeDataUseCaseMock.execute.mockReturnValue(throwError(() => new Error('down')));

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.payload).toEqual({ message: 'No fue posible cargar la información.' });
    expect(component.isLoading).toBe(false);
  });

  it('updates admin search term', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    component.onAdminSearchChanged('abc');
    expect(component.adminSearchTerm).toBe('abc');
  });
});
