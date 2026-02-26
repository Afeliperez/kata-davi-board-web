import { Component, DestroyRef, inject } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionExpiredModalComponent } from './presentation/shared/components/session-expired-modal/session-expired-modal.component';
import { GlobalLoaderComponent } from './presentation/shared/components/global-loader/global-loader.component';
import { GlobalLoaderService } from '@presentation/shared/services/global-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SessionExpiredModalComponent, GlobalLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly globalLoaderService = inject(GlobalLoaderService);

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.globalLoaderService.show();
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.globalLoaderService.hide();
        }
      });
  }
}
