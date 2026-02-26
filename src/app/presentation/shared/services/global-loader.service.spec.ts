import { GlobalLoaderService } from '@presentation/shared/services/global-loader.service';

describe('GlobalLoaderService', () => {
  let service: GlobalLoaderService;

  beforeEach(() => {
    service = new GlobalLoaderService();
  });

  it('turns loading on when showing loader', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('keeps loading true while there are pending requests', () => {
    service.show();
    service.show();
    service.hide();
    expect(service.isLoading()).toBe(true);
  });

  it('turns loading off when all requests finish', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('does not go below zero on hide', () => {
    service.hide();
    expect(service.isLoading()).toBe(false);
  });
});
