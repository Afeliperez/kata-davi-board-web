import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpAuthRepository } from '@infrastructure/adapters/auth/http-auth.repository';

describe('HttpAuthRepository', () => {
  let repository: HttpAuthRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpAuthRepository, provideHttpClient(), provideHttpClientTesting()],
    });

    repository = TestBed.inject(HttpAuthRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps successful login response', (done) => {
    repository.login({ cc: '123', password: '12345678' }).subscribe({
      next: (session) => {
        expect(session.token).toBe('abc-token');
        expect(session.user.cc).toBe('123');
        done();
      },
      error: done,
    });

    const request = httpMock.expectOne('/kata-api/users/login');
    expect(request.request.method).toBe('POST');
    request.flush({
      data: {
        token: 'abc-token',
        user: {
          cc: '123',
          email: 'user@mail.com',
          userName: 'User',
          role: 'DEV',
        },
      },
      expiresAt: Date.now() + 60_000,
    });
  });

  it('fails when response has no token', (done) => {
    repository.login({ cc: '123', password: '12345678' }).subscribe({
      next: () => done(new Error('Expected missing token error')),
      error: (error) => {
        expect(String(error.message)).toContain('no incluye token');
        done();
      },
    });

    const request = httpMock.expectOne('/kata-api/users/login');
    request.flush({
      data: {
        user: {
          cc: '123',
          email: 'user@mail.com',
          userName: 'User',
          role: 'DEV',
        },
      },
    });
  });

  it('fails when response has no user', (done) => {
    repository.login({ cc: '123', password: '12345678' }).subscribe({
      next: () => done(new Error('Expected missing user error')),
      error: (error) => {
        expect(String(error.message)).toContain('no incluye el usuario');
        done();
      },
    });

    const request = httpMock.expectOne('/kata-api/users/login');
    request.flush({ token: 'abc-token' });
  });

  it('propagates service outage', (done) => {
    repository.login({ cc: '123', password: '12345678' }).subscribe({
      next: () => done(new Error('Expected 503 error')),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(503);
        done();
      },
    });

    const request = httpMock.expectOne('/kata-api/users/login');
    request.flush({ message: 'Service unavailable' }, { status: 503, statusText: 'Service Unavailable' });
  });

  it('uses top-level accessToken fallback and computed expiration', (done) => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);

    repository.login({ cc: '123', password: '12345678' }).subscribe({
      next: (session) => {
        expect(session.token).toBe('top-token');
        expect(session.expiresAt).toBe(301_000);
        nowSpy.mockRestore();
        done();
      },
      error: (error) => {
        nowSpy.mockRestore();
        done(error);
      },
    });

    const request = httpMock.expectOne('/kata-api/users/login');
    request.flush({
      accessToken: 'top-token',
      data: {
        user: {
          cc: '123',
          email: 'user@mail.com',
          userName: 'User',
          role: 'DEV',
        },
      },
      expiresIn: 300,
    });
  });

  it('reads exp from JWT when expiresAt is missing', (done) => {
    const payload = btoa(JSON.stringify({ exp: 200 }));
    const token = `x.${payload}.y`;

    repository.login({ cc: '123', password: '12345678' }).subscribe({
      next: (session) => {
        expect(session.expiresAt).toBe(200_000);
        done();
      },
      error: done,
    });

    const request = httpMock.expectOne('/kata-api/users/login');
    request.flush({
      token,
      data: {
        user: {
          cc: '123',
          email: 'user@mail.com',
          userName: 'User',
          role: 'DEV',
        },
      },
    });
  });
});
