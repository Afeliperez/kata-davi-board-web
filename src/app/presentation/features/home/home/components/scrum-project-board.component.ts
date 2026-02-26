import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ManageSmProjectsUseCase } from '../../../../../application/use-cases/home/manage-sm-projects.use-case';
import { HuItem, ProjectBoardSummary } from '../../../../../domain/ports/home-data-repository.port';

@Component({
  selector: 'app-scrum-project-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './scrum-project-board.component.html',
  styleUrl: './scrum-project-board.component.scss',
})
export class ScrumProjectBoardComponent implements OnChanges {
  private readonly manageSmProjectsUseCase = inject(ManageSmProjectsUseCase);

  @Input() project: ProjectBoardSummary | null = null;
  @Input() canEdit = true;
  @Input() userRole = '';
  @Output() huMoved = new EventEmitter<{
    item: HuItem;
    fromStatus: string;
    toStatus: string;
    previousIndex: number;
    currentIndex: number;
    sameColumn: boolean;
  }>();

  columns: Array<{ title: string; statusValue: string; cards: HuItem[] }> = [];
  permissionMessage = '';
  private readonly collapsedByStatus = new Map<string, boolean>();

  isColumnCollapsed(statusValue: string): boolean {
    return this.collapsedByStatus.get(statusValue) ?? false;
  }

  toggleColumn(statusValue: string): void {
    const collapsed = this.isColumnCollapsed(statusValue);
    this.collapsedByStatus.set(statusValue, !collapsed);
  }

  canDragFromStatus(status: string): boolean {
    if (!this.canEdit) {
      return false;
    }

    const normalizedRole = this.normalizeRole(this.userRole);

    if (normalizedRole === 'SM' || normalizedRole === 'SCRUM') {
      return true;
    }

    const fromStatus = this.normalizeStatus(status);

    if (normalizedRole === 'PO') {
      return fromStatus === 'validacion_po';
    }

    if (normalizedRole === 'DEV') {
      return ['por_hacer', 'en_curso', 'test'].includes(fromStatus);
    }

    if (normalizedRole === 'QA') {
      return ['en_curso', 'test', 'validacion_po'].includes(fromStatus);
    }

    return false;
  }

  canMoveBetweenStatuses(fromStatus: string, toStatus: string): boolean {
    if (!this.canEdit) {
      return false;
    }

    const normalizedRole = this.normalizeRole(this.userRole);

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

  getCardStatusClass(status: string): string {
    const normalizedStatus = this.normalizeStatus(status);

    switch (normalizedStatus) {
      case 'backlog':
        return 'card-status-backlog';
      case 'por_hacer':
      case 'todo':
        return 'card-status-por-hacer';
      case 'en_curso':
      case 'in_progress':
        return 'card-status-en-curso';
      case 'test':
      case 'testing':
        return 'card-status-test';
      case 'validacion_po':
      case 'po':
        return 'card-status-validacion-po';
      case 'finalizado':
      case 'done':
      case 'finished':
        return 'card-status-finalizado';
      default:
        return 'card-status-default';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['project']) {
      return;
    }

    const sourceColumns = this.manageSmProjectsUseCase.buildColumns(this.project);
    this.columns = sourceColumns.map((column) => ({
      title: column.title,
      statusValue: column.statusValue,
      cards: column.cards.map((card) => ({ ...card })),
    }));

    this.columns.forEach((column) => {
      if (!this.collapsedByStatus.has(column.statusValue)) {
        this.collapsedByStatus.set(column.statusValue, false);
      }
    });
  }

  onDrop(event: CdkDragDrop<HuItem[]>, toStatus: string): void {
    if (!this.canEdit) {
      this.permissionMessage = 'Tu rol no tiene permisos para mover tarjetas.';
      return;
    }

    this.permissionMessage = '';

    const item = event.item.data as HuItem | undefined;

    if (!item) {
      return;
    }

    const fromStatus = item.status;

    if (!this.canMoveBetweenStatuses(fromStatus, toStatus)) {
      this.permissionMessage = `No puedes mover una HU de ${this.getStatusLabel(fromStatus)} a ${this.getStatusLabel(toStatus)} con el rol ${this.normalizeRole(this.userRole)}.`;
      return;
    }

    const sameColumn = event.previousContainer === event.container;

    if (sameColumn) {
      if (event.previousIndex === event.currentIndex) {
        return;
      }

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      event.container.data[event.currentIndex] = {
        ...event.container.data[event.currentIndex],
        status: toStatus,
      };
    }

    const movedItem = event.container.data[event.currentIndex];

    if (!movedItem) {
      return;
    }

    this.huMoved.emit({
      item: movedItem,
      fromStatus,
      toStatus,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      sameColumn,
    });
  }

  private getStatusLabel(status: string): string {
    switch (this.normalizeStatus(status)) {
      case 'backlog':
        return 'Backlog';
      case 'por_hacer':
      case 'todo':
        return 'Por hacer';
      case 'en_curso':
      case 'in_progress':
        return 'En curso';
      case 'test':
      case 'testing':
        return 'Test';
      case 'validacion_po':
      case 'po':
        return 'Validación PO';
      case 'finalizado':
      case 'done':
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  }

  private normalizeStatus(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '_');
  }

  private normalizeRole(value: string): string {
    return value.trim().toUpperCase();
  }
}
