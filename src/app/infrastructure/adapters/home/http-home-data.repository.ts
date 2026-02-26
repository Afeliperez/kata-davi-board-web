import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  AccessBoardsPayload,
  ApiEnvelope,
  CreateProjectCommand,
  CreateUserCommand,
  HomeDataRepositoryPort,
  HomeDataResult,
  ProjectBoardsPayload,
  ProjectBoardSummary,
  UpdateProjectCommand,
  UpdateUserCommand,
  UserSummary,
  UsersPayload,
} from '@domain/ports/home-data-repository.port';

@Injectable({ providedIn: 'root' })
export class HttpHomeDataRepository implements HomeDataRepositoryPort {
  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<HomeDataResult<UsersPayload>> {
    const endpoint = '/kata-api/users';
    return this.http.get<UsersPayload>(endpoint).pipe(map((data) => ({ endpoint, data })));
  }

  getProjectBoards(): Observable<HomeDataResult<ProjectBoardsPayload>> {
    const endpoint = '/kata-api/project-boards';
    return this
      .http
      .get<ProjectBoardsPayload>(endpoint)
      .pipe(map((data) => ({ endpoint, data })));
  }

  getProjectBoardsByAccess(cc: string): Observable<HomeDataResult<AccessBoardsPayload>> {
    const endpoint = `/kata-api/project-boards/access/${cc}`;
    return this
      .http
      .get<AccessBoardsPayload>(endpoint)
      .pipe(map((data) => ({ endpoint, data })));
  }

  createUser(payload: CreateUserCommand): Observable<HomeDataResult<ApiEnvelope<UserSummary>>> {
    const endpoint = '/kata-api/users';
    return this
      .http
      .post<ApiEnvelope<UserSummary>>(endpoint, payload)
      .pipe(map((data) => ({ endpoint, data })));
  }

  updateUser(cc: string, payload: UpdateUserCommand): Observable<HomeDataResult<ApiEnvelope<UserSummary>>> {
    const endpoint = `/kata-api/users/${cc}`;
    return this
      .http
      .put<ApiEnvelope<UserSummary>>(endpoint, payload)
      .pipe(map((data) => ({ endpoint, data })));
  }

  deleteUser(cc: string): Observable<HomeDataResult<ApiEnvelope<{ success: boolean }>>> {
    const endpoint = `/kata-api/users/${cc}`;
    return this
      .http
      .delete<ApiEnvelope<{ success: boolean }>>(endpoint)
      .pipe(map((data) => ({ endpoint, data })));
  }

  createProject(
    payload: CreateProjectCommand,
  ): Observable<HomeDataResult<ApiEnvelope<ProjectBoardSummary>>> {
    const endpoint = '/kata-api/project-boards';
    return this
      .http
      .post<ApiEnvelope<ProjectBoardSummary>>(endpoint, payload)
      .pipe(map((data) => ({ endpoint, data })));
  }

  updateProject(
    pro: string,
    payload: UpdateProjectCommand,
  ): Observable<HomeDataResult<ApiEnvelope<ProjectBoardSummary>>> {
    const endpoint = `/kata-api/project-boards/${pro}`;
    return this
      .http
      .put<ApiEnvelope<ProjectBoardSummary>>(endpoint, payload)
      .pipe(map((data) => ({ endpoint, data })));
  }

  deleteProject(pro: string): Observable<HomeDataResult<ApiEnvelope<{ success: boolean }>>> {
    const endpoint = `/kata-api/project-boards/${pro}`;
    return this
      .http
      .delete<ApiEnvelope<{ success: boolean }>>(endpoint)
      .pipe(map((data) => ({ endpoint, data })));
  }
}
