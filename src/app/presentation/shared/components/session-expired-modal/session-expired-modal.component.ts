import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SessionUiService } from '@presentation/shared/services/session-ui.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-expired-modal.component.html',
  styleUrl: './session-expired-modal.component.scss',
})
export class SessionExpiredModalComponent {
  readonly sessionUiService = inject(SessionUiService);

  close(): void {
    this.sessionUiService.close();
  }
}
