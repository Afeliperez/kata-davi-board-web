import { AuthSessionService } from '@infrastructure/services/auth/auth-session.service';

describe('AuthSessionService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and returns user snapshot', () => {
    const service = new AuthSessionService();
    const user = { cc: '1', email: 'a@a.com', userName: 'User', role: 'DEV' };

    service.setUser(user);

    expect(service.getUserSnapshot()).toEqual(user);
    expect(localStorage.getItem('auth_user')).toContain('User');
  });

  it('clears user session', () => {
    const service = new AuthSessionService();
    service.setUser({ cc: '1', email: 'a@a.com', userName: 'User', role: 'DEV' });
    service.clear();

    expect(service.getUserSnapshot()).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('starts with null user when storage has invalid JSON', () => {
    localStorage.setItem('auth_user', '{invalid');
    const service = new AuthSessionService();
    expect(service.getUserSnapshot()).toBeNull();
  });
});
