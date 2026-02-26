import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from '@app/app.component';
import { GlobalLoaderService } from '@presentation/shared/services/global-loader.service';

describe('AppComponent', () => {
  const events$ = new Subject<unknown>();
  const routerMock = {
    events: events$.asObservable(),
  };

  const globalLoaderServiceMock = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: GlobalLoaderService, useValue: globalLoaderServiceMock },
      ],
    }).compileComponents();
  });

  it('shows loader on navigation start', () => {
    TestBed.createComponent(AppComponent);
    events$.next(new NavigationStart(1, '/home'));
    expect(globalLoaderServiceMock.show).toHaveBeenCalledTimes(1);
  });

  it('hides loader on navigation end/cancel/error', () => {
    TestBed.createComponent(AppComponent);
    events$.next(new NavigationEnd(2, '/home', '/home'));
    events$.next(new NavigationCancel(3, '/home', 'cancel'));
    events$.next(new NavigationError(4, '/home', new Error('x')));
    expect(globalLoaderServiceMock.hide).toHaveBeenCalledTimes(3);
  });
});
