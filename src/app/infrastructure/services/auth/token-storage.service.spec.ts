import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new TokenStorageService();
  });

  it('should save and read token', () => {
    const expiresAt = Date.now() + 60_000;

    service.saveToken('my-token', expiresAt);

    expect(service.getToken()).toBe('my-token');
    expect(service.getExpiration()).toBe(expiresAt);
  });

  it('should mark token as invalid when expired', () => {
    service.saveToken('expired-token', Date.now() - 1);

    expect(service.isTokenValid()).toBe(false);
  });

  it('should clear token data', () => {
    service.saveToken('my-token', Date.now() + 60_000);

    service.clear();

    expect(service.getToken()).toBeNull();
    expect(service.getExpiration()).toBe(0);
  });
});
