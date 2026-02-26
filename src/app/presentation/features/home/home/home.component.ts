import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { GetHomeDataUseCase } from '../../../../application/use-cases/home/get-home-data.use-case';
import { LogoutUseCase } from '../../../../application/use-cases/auth/logout.use-case';
import { HomePayload } from '../../../../domain/ports/home-data-repository.port';
import { AuthSessionService } from '../../../../infrastructure/services/auth/auth-session.service';
import { HomeHeaderComponent } from './components/home-header/home-header.component';
import { HomeBodyComponent } from './components/home-body/home-body.component';
import { HomeFooterComponent } from './components/home-footer/home-footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HomeHeaderComponent, HomeBodyComponent, HomeFooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly getHomeDataUseCase = inject(GetHomeDataUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);

  userRole = '';
  currentUserName = '';
  adminSearchTerm = '';
  endpointUsed = '';
  payload: HomePayload | { message: string } | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadDataByRole();
  }

  private loadDataByRole(): void {
    this.authSessionService.user$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        this.logout();
        this.endpointUsed = '';
        this.payload = null;
        this.userRole = '';
        this.currentUserName = '';
        this.adminSearchTerm = '';
        return;
      }

      this.currentUserName = user.userName;
      this.userRole = user.role.toUpperCase();

      if (this.userRole === 'ADMIN' || this.userRole === 'SM' || this.userRole === 'SCRUM') {
        this.endpointUsed = '';
        this.payload = null;
        this.isLoading = false;
        this.adminSearchTerm = '';
        return;
      }

      this.isLoading = true;
      this.endpointUsed = '';
      this.payload = null;

      this.getHomeDataUseCase
        .execute(user)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (result) => {
            this.endpointUsed = result.endpoint;
            this.payload = result.data;
          },
          error: () => {
            this.payload = { message: 'No fue posible cargar la información.' };
          },
        });
    });
  }

  logout(): void {
    this.logoutUseCase.execute();
    this.router.navigate(['/login']);
  }

  onAdminSearchChanged(searchTerm: string): void {
    this.adminSearchTerm = searchTerm;
  }
}
