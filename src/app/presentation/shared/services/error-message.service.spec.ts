import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMessageService } from '@presentation/shared/services/error-message.service';

describe('ErrorMessageService', () => {
  const service = new ErrorMessageService();

  it('returns null when payload is empty', () => {
    const result = service.extract(new HttpErrorResponse({ error: null }));
    expect(result).toBeNull();
  });

  it('extracts string payload', () => {
    const result = service.extract(new HttpErrorResponse({ error: 'raw-error' }));
    expect(result).toBe('raw-error');
  });

  it('extracts message payload', () => {
    const result = service.extract(new HttpErrorResponse({ error: { message: 'message-error' } }));
    expect(result).toBe('message-error');
  });

  it('extracts first message when payload.message is array', () => {
    const result = service.extract(new HttpErrorResponse({ error: { message: ['first', 'second'] } }));
    expect(result).toBe('first');
  });

  it('extracts payload.error when it is string', () => {
    const result = service.extract(new HttpErrorResponse({ error: { error: 'nested-error' } }));
    expect(result).toBe('nested-error');
  });
});
