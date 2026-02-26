import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from '@app/app.component';
import { routes } from '@app/app.routes';
import { authInterceptor } from '@presentation/interceptors/auth.interceptor';
import { AUTH_REPOSITORY } from '@domain/ports/auth-repository.port';
import { HttpAuthRepository } from '@infrastructure/adapters/auth/http-auth.repository';
import { HOME_DATA_REPOSITORY } from '@domain/ports/home-data-repository.port';
import { HttpHomeDataRepository } from '@infrastructure/adapters/home/http-home-data.repository';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: AUTH_REPOSITORY,
      useClass: HttpAuthRepository,
    },
    {
      provide: HOME_DATA_REPOSITORY,
      useClass: HttpHomeDataRepository,
    },
  ],
}).catch((error) => console.error(error));
