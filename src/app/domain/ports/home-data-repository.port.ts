import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser } from './auth-repository.port';

export interface UserSummary {
  cc: string;
  email: string;
  userName: string;
  role: string;
  [key: string]: unknown;
}

export interface CreateUserCommand {
  cc: string;
  email: string;
  userName: string;
  role: string;
  password: string;
}

export interface UpdateUserCommand {
  email: string;
  userName: string;
  role: string;
}

export interface ProjectBoardSummary {
  pro: string;
  projectName: string;
  hu: HuItem[];
  accesos: string[];
  [key: string]: unknown;
}

export interface HuItem {
  hu: string;
  descripcion: string;
  status: string;
}

export interface CreateProjectCommand {
  pro: string;
  projectName: string;
  hu: HuItem[];
  accesos: string[];
}

export interface UpdateProjectCommand {
  projectName: string;
  hu: HuItem[];
  accesos: string[];
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  [key: string]: unknown;
}

export type UsersPayload = ApiEnvelope<UserSummary[] | UserSummary>;
export type ProjectBoardsPayload = ApiEnvelope<ProjectBoardSummary[] | ProjectBoardSummary>;
export type AccessBoardsPayload = ApiEnvelope<ProjectBoardSummary[] | ProjectBoardSummary>;
export type HomePayload = UsersPayload | ProjectBoardsPayload | AccessBoardsPayload;

export interface HomeDataResult<TPayload = HomePayload> {
  endpoint: string;
  data: TPayload;
}

export interface HomeDataRepositoryPort {
  getUsers(): Observable<HomeDataResult<UsersPayload>>;
  getProjectBoards(): Observable<HomeDataResult<ProjectBoardsPayload>>;
  getProjectBoardsByAccess(cc: string): Observable<HomeDataResult<AccessBoardsPayload>>;
  createUser(payload: CreateUserCommand): Observable<HomeDataResult<ApiEnvelope<UserSummary>>>;
  updateUser(cc: string, payload: UpdateUserCommand): Observable<HomeDataResult<ApiEnvelope<UserSummary>>>;
  deleteUser(cc: string): Observable<HomeDataResult<ApiEnvelope<{ success: boolean }>>>;
  createProject(
    payload: CreateProjectCommand,
  ): Observable<HomeDataResult<ApiEnvelope<ProjectBoardSummary>>>;
  updateProject(
    pro: string,
    payload: UpdateProjectCommand,
  ): Observable<HomeDataResult<ApiEnvelope<ProjectBoardSummary>>>;
  deleteProject(pro: string): Observable<HomeDataResult<ApiEnvelope<{ success: boolean }>>>;
}

export type HomeRoleStrategy = (user: AuthUser) => Observable<HomeDataResult<HomePayload>>;

export const HOME_DATA_REPOSITORY = new InjectionToken<HomeDataRepositoryPort>(
  'HOME_DATA_REPOSITORY',
);
