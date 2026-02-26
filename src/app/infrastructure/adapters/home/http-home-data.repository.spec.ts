import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpHomeDataRepository } from '@infrastructure/adapters/home/http-home-data.repository';

describe('HttpHomeDataRepository', () => {
  let repository: HttpHomeDataRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpHomeDataRepository, provideHttpClient(), provideHttpClientTesting()],
    });

    repository = TestBed.inject(HttpHomeDataRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns users payload on successful request', (done) => {
    repository.getUsers().subscribe({
      next: (result) => {
        expect(result.endpoint).toBe('/kata-api/users');
        expect(result.data.data).toEqual([{ cc: '1', email: 'a@b.com', userName: 'U', role: 'ADMIN' }]);
        done();
      },
      error: done,
    });

    const request = httpMock.expectOne('/kata-api/users');
    expect(request.request.method).toBe('GET');
    request.flush({ data: [{ cc: '1', email: 'a@b.com', userName: 'U', role: 'ADMIN' }] });
  });

  it('hits access endpoint with cc parameter', (done) => {
    repository.getProjectBoardsByAccess('123').subscribe({
      next: (result) => {
        expect(result.endpoint).toBe('/kata-api/project-boards/access/123');
        done();
      },
      error: done,
    });

    const request = httpMock.expectOne('/kata-api/project-boards/access/123');
    expect(request.request.method).toBe('GET');
    request.flush({ data: [] });
  });

  it('propagates failed update request', (done) => {
    repository.updateUser('123', { email: 'x@y.com', userName: 'New', role: 'DEV' }).subscribe({
      next: () => done(new Error('Expected update user failure')),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(400);
        done();
      },
    });

    const request = httpMock.expectOne('/kata-api/users/123');
    expect(request.request.method).toBe('PUT');
    request.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
  });

  it('propagates service outage from projects endpoint', (done) => {
    repository.getProjectBoards().subscribe({
      next: () => done(new Error('Expected projects outage error')),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(503);
        done();
      },
    });

    const request = httpMock.expectOne('/kata-api/project-boards');
    expect(request.request.method).toBe('GET');
    request.flush({ message: 'Unavailable' }, { status: 503, statusText: 'Service Unavailable' });
  });

  it('creates, updates and deletes user/project endpoints', (done) => {
    let completed = 0;
    const onComplete = () => {
      completed += 1;
      if (completed === 5) {
        done();
      }
    };

    repository.createUser({ cc: '1', email: 'a', userName: 'u', role: 'QA', password: '12345678' }).subscribe({
      next: (result) => {
        expect(result.endpoint).toBe('/kata-api/users');
        onComplete();
      },
      error: done,
    });

    repository.deleteUser('1').subscribe({
      next: (result) => {
        expect(result.endpoint).toBe('/kata-api/users/1');
        onComplete();
      },
      error: done,
    });

    repository.createProject({ pro: 'P1', projectName: 'X', hu: [], accesos: [] }).subscribe({
      next: (result) => {
        expect(result.endpoint).toBe('/kata-api/project-boards');
        onComplete();
      },
      error: done,
    });

    repository.updateProject('P1', { projectName: 'Y', hu: [], accesos: [] }).subscribe({
      next: (result) => {
        expect(result.endpoint).toBe('/kata-api/project-boards/P1');
        onComplete();
      },
      error: done,
    });

    repository.deleteProject('P1').subscribe({
      next: (result) => {
        expect(result.endpoint).toBe('/kata-api/project-boards/P1');
        onComplete();
      },
      error: done,
    });

    httpMock.expectOne('/kata-api/users').flush({ data: { cc: '1' } });
    httpMock.expectOne('/kata-api/users/1').flush({ data: { success: true } });
    httpMock.expectOne('/kata-api/project-boards').flush({ data: { pro: 'P1' } });
    const projectRequests = httpMock.match('/kata-api/project-boards/P1');
    expect(projectRequests).toHaveLength(2);
    projectRequests[0].flush({ data: { pro: 'P1' } });
    projectRequests[1].flush({ data: { success: true } });
  });
});
