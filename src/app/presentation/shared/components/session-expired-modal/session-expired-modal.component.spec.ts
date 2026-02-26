import { TestBed } from '@angular/core/testing';
import { SessionExpiredModalComponent } from '@presentation/shared/components/session-expired-modal/session-expired-modal.component';
import { SessionUiService } from '@presentation/shared/services/session-ui.service';

describe('SessionExpiredModalComponent', () => {
  const sessionUiMock = {
    close: jest.fn(),
    isOpen: () => false,
    message: () => '',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SessionExpiredModalComponent],
      providers: [{ provide: SessionUiService, useValue: sessionUiMock }],
    }).compileComponents();
  });

  it('closes modal via service', () => {
    const fixture = TestBed.createComponent(SessionExpiredModalComponent);
    fixture.componentInstance.close();
    expect(sessionUiMock.close).toHaveBeenCalledTimes(1);
  });
});
