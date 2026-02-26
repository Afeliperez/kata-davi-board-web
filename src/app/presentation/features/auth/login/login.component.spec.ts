import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CheckSessionUseCase } from '@application/use-cases/auth/check-session.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { LoginComponent } from '@presentation/features/auth/login/login.component';
import { ErrorMessageService } from '@presentation/shared/services/error-message.service';

describe('LoginComponent', () => {
  const routerMock = {
    navigate: jest.fn(),
  };

  const checkSessionUseCaseMock = {
    execute: jest.fn<boolean, []>(),
  };

  const loginUseCaseMock = {
    execute: jest.fn(),
  };

  const errorMessageServiceMock = {
    extract: jest.fn<string | null, [HttpErrorResponse]>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: CheckSessionUseCase, useValue: checkSessionUseCaseMock },
        { provide: LoginUseCase, useValue: loginUseCaseMock },
        { provide: ErrorMessageService, useValue: errorMessageServiceMock },
      ],
    }).compileComponents();
  });

  it('redirects to home when session is already valid', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(true);
    const fixture = TestBed.createComponent(LoginComponent);

    fixture.componentInstance.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('marks form as touched and does not call login when form is invalid', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.submit();

    expect(loginUseCaseMock.execute).not.toHaveBeenCalled();
    expect(component.form.controls.cc.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);
  });

  it('submits valid form and navigates on success', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    loginUseCaseMock.execute.mockReturnValue(
      of({ token: 'x', expiresAt: Date.now() + 60_000, user: { cc: '1', email: 'a@b.com', userName: 'u', role: 'DEV' } }),
    );
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.form.setValue({ cc: '12345', password: '12345678' });
    component.submit();

    expect(loginUseCaseMock.execute).toHaveBeenCalledWith({ cc: '12345', password: '12345678' });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('shows backend message for unauthorized request', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    errorMessageServiceMock.extract.mockReturnValue('Credenciales inválidas desde backend');
    loginUseCaseMock.execute.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })),
    );

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({ cc: '12345', password: '12345678' });

    component.submit();

    expect(component.loginError).toBe('Credenciales inválidas desde backend');
  });

  it('shows generic message on service outage', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    errorMessageServiceMock.extract.mockReturnValue(null);
    loginUseCaseMock.execute.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' })),
    );

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.setValue({ cc: '12345', password: '12345678' });

    component.submit();

    expect(component.loginError).toBe('No fue posible iniciar sesión. Inténtalo nuevamente.');
  });

  it('sanitizes non numeric CC input', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    const input = { value: '12a-3b' } as HTMLInputElement;
    component.sanitizeCcInput({ target: input } as Event);

    expect(component.form.controls.cc.value).toBe('123');
  });

  it('prevents non numeric key press', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    const preventDefault = jest.fn();
    component.allowOnlyNumbers({
      key: 'a',
      ctrlKey: false,
      metaKey: false,
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalled();
  });

  it('allows ctrl shortcuts on key press', () => {
    checkSessionUseCaseMock.execute.mockReturnValue(false);
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    const preventDefault = jest.fn();
    component.allowOnlyNumbers({
      key: 'v',
      ctrlKey: true,
      metaKey: false,
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
