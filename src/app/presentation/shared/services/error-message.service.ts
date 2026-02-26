import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {
  extract(error: HttpErrorResponse): string | null {
    const payload = error.error;

    if (!payload) {
      return null;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload.message === 'string') {
      return payload.message;
    }

    if (Array.isArray(payload.message) && typeof payload.message[0] === 'string') {
      return payload.message[0];
    }

    if (typeof payload.error === 'string') {
      return payload.error;
    }

    return null;
  }
}
