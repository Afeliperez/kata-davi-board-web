import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalLoaderService {
  private activeRequests = 0;
  private readonly loadingSignal = signal(false);

  readonly isLoading = this.loadingSignal.asReadonly();

  show(): void {
    this.activeRequests += 1;
    this.loadingSignal.set(true);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    if (this.activeRequests === 0) {
      this.loadingSignal.set(false);
    }
  }
}
