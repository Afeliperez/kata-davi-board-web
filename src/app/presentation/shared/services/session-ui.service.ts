import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionUiService {
  private readonly openSignal = signal(false);
  private readonly messageSignal = signal('Tu sesión expiró. Inicia sesión nuevamente.');

  readonly isOpen = this.openSignal.asReadonly();
  readonly message = this.messageSignal.asReadonly();

  open(message?: string): void {
    if (message) {
      this.messageSignal.set(message);
    }

    this.openSignal.set(true);
  }

  close(): void {
    this.openSignal.set(false);
  }
}
