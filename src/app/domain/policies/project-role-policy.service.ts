import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectRolePolicyService {
  canEditBoard(role: string): boolean {
    const normalizedRole = this.normalizeRole(role);
    return ['SM', 'SCRUM', 'PO', 'DEV', 'QA'].includes(normalizedRole);
  }

  canEditProjectHuSection(role: string): boolean {
    const normalizedRole = this.normalizeRole(role);
    return ['SM', 'SCRUM', 'PO'].includes(normalizedRole);
  }

  canDragFromStatus(role: string, status: string, canEdit: boolean): boolean {
    if (!canEdit) {
      return false;
    }

    const normalizedRole = this.normalizeRole(role);

    if (normalizedRole === 'SM' || normalizedRole === 'SCRUM') {
      return true;
    }

    const normalizedStatus = this.normalizeStatus(status);

    if (normalizedRole === 'PO') {
      return normalizedStatus === 'validacion_po';
    }

    if (normalizedRole === 'DEV') {
      return ['por_hacer', 'en_curso', 'test'].includes(normalizedStatus);
    }

    if (normalizedRole === 'QA') {
      return ['en_curso', 'test', 'validacion_po'].includes(normalizedStatus);
    }

    return false;
  }

  canMoveBetweenStatuses(
    role: string,
    fromStatus: string,
    toStatus: string,
    canEdit: boolean,
  ): boolean {
    if (!canEdit) {
      return false;
    }

    const normalizedRole = this.normalizeRole(role);

    if (normalizedRole === 'SM' || normalizedRole === 'SCRUM') {
      return true;
    }

    const normalizedFrom = this.normalizeStatus(fromStatus);
    const normalizedTo = this.normalizeStatus(toStatus);

    if (normalizedRole === 'PO') {
      return normalizedFrom === 'validacion_po' && normalizedTo === 'finalizado';
    }

    if (normalizedRole === 'DEV') {
      return ['por_hacer', 'en_curso', 'test'].includes(normalizedFrom)
        && ['por_hacer', 'en_curso', 'test'].includes(normalizedTo);
    }

    if (normalizedRole === 'QA') {
      return ['en_curso', 'test', 'validacion_po'].includes(normalizedFrom)
        && ['en_curso', 'test', 'validacion_po'].includes(normalizedTo);
    }

    return false;
  }

  isPo(role: string): boolean {
    return this.normalizeRole(role) === 'PO';
  }

  isScrum(role: string): boolean {
    const normalizedRole = this.normalizeRole(role);
    return normalizedRole === 'SM' || normalizedRole === 'SCRUM';
  }

  normalizeRole(value: string): string {
    return value.trim().toUpperCase();
  }

  normalizeStatus(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '_');
  }
}
