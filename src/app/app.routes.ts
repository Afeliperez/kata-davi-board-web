import { Routes } from '@angular/router';
import { authGuard } from '@presentation/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('@presentation/features/auth/login/login.component').then((module) => module.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('@presentation/features/home/home/home.component').then((module) => module.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'home/project-board/:pro',
    loadComponent: () =>
      import('@presentation/features/home/home/project-board-page.component').then(
        (module) => module.ProjectBoardPageComponent,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
