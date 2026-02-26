import { SessionUiService } from '@presentation/shared/services/session-ui.service';

describe('SessionUiService', () => {
  let service: SessionUiService;

  beforeEach(() => {
    service = new SessionUiService();
  });

  it('opens modal with default message', () => {
    service.open();
    expect(service.isOpen()).toBe(true);
    expect(service.message()).toContain('Tu sesión expiró');
  });

  it('opens modal with custom message', () => {
    service.open('Mensaje custom');
    expect(service.isOpen()).toBe(true);
    expect(service.message()).toBe('Mensaje custom');
  });

  it('closes modal', () => {
    service.open('x');
    service.close();
    expect(service.isOpen()).toBe(false);
  });
});
