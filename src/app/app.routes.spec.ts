import { authGuard } from '@presentation/guards/auth.guard';
import { routes } from '@app/app.routes';

describe('app routes', () => {
  it('defines expected route table', () => {
    expect(routes.length).toBe(5);
    expect(routes[0]).toEqual({ path: '', pathMatch: 'full', redirectTo: 'login' });
    expect(routes[1].path).toBe('login');
    expect(routes[2].path).toBe('home');
    expect(routes[3].path).toBe('home/project-board/:pro');
    expect(routes[4]).toEqual({ path: '**', redirectTo: 'login' });
    expect(routes[2].canActivate).toEqual([authGuard]);
  });

  it('lazy loaders are functions', () => {
    expect(typeof routes[1].loadComponent).toBe('function');
    expect(typeof routes[2].loadComponent).toBe('function');
    expect(typeof routes[3].loadComponent).toBe('function');
  });

  it('resolves lazy component imports', async () => {
    const loginComponent = await routes[1].loadComponent?.();
    const homeComponent = await routes[2].loadComponent?.();
    const boardComponent = await routes[3].loadComponent?.();

    expect(loginComponent).toBeTruthy();
    expect(homeComponent).toBeTruthy();
    expect(boardComponent).toBeTruthy();
  });
});
