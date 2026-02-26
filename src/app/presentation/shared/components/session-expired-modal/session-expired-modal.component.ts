import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SessionUiService } from '@presentation/shared/services/session-ui.service';

@Component({
  selector: 'app-session-expired-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-expired-modal.component.html',
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .modal {
        width: min(420px, 90vw);
        background: #fff;
        border-radius: 10px;
        padding: 1.2rem;
      }

      button {
        margin-top: 1rem;
        border: none;
        border-radius: 6px;
        padding: 0.55rem 1rem;
        cursor: pointer;
      }
    `,
  ],
})
export class SessionExpiredModalComponent {
  readonly sessionUiService = inject(SessionUiService);

  close(): void {
    this.sessionUiService.close();
  }
}
