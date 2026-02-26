import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ManageSmProjectsUseCase } from '@application/use-cases/home/manage-sm-projects.use-case';
import { HuItem, ProjectBoardSummary } from '@domain/ports/home-data-repository.port';
import {ProjectRolePolicyService} from "@domain/policies/project-role-policy.service"
interface BoardCardVm extends HuItem {
  statusClass: string;
  statusLabel: string;
  statusIcon: string;
}

interface BoardColumnVm {
  title: string;
  statusValue: string;
  cards: BoardCardVm[];
}

@Component({
  selector: 'app-scrum-project-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './scrum-project-board.component.html',
  styleUrl: './scrum-project-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrumProjectBoardComponent implements OnChanges {
  private readonly manageSmProjectsUseCase = inject(ManageSmProjectsUseCase);
  private readonly projectRolePolicy = inject(ProjectRolePolicyService);

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

  columns: BoardColumnVm[] = [];
  permissionMessage = '';
  private readonly collapsedByStatus = new Map<string, boolean>();

  trackByColumn(_index: number, column: BoardColumnVm): string {
    return column.statusValue;
  }

  trackByCard(_index: number, item: BoardCardVm): string {
    return `${item.hu}-${item.status}-${item.descripcion}`;
  }

  isColumnCollapsed(statusValue: string): boolean {
    return this.collapsedByStatus.get(statusValue) ?? false;
  }

  toggleColumn(statusValue: string): void {
    const collapsed = this.isColumnCollapsed(statusValue);
    this.collapsedByStatus.set(statusValue, !collapsed);
  }

  canDragFromStatus(status: string): boolean {
    return this.projectRolePolicy.canDragFromStatus(this.userRole, status, this.canEdit);
  }

  canMoveBetweenStatuses(fromStatus: string, toStatus: string): boolean {
    return this.projectRolePolicy.canMoveBetweenStatuses(
      this.userRole,
      fromStatus,
      toStatus,
      this.canEdit,
    );
  }

  private getCardStatusClass(status: string): string {
    const normalizedStatus = this.projectRolePolicy.normalizeStatus(status);

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

  private getCardStatusLabel(status: string): string {
    switch (this.projectRolePolicy.normalizeStatus(status)) {
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

  private getCardStatusIcon(status: string): string {
    switch (this.projectRolePolicy.normalizeStatus(status)) {
      case 'backlog':
        return '🗂️';
      case 'por_hacer':
      case 'todo':
        return '📌';
      case 'en_curso':
      case 'in_progress':
        return '⚙️';
      case 'test':
      case 'testing':
        return '🧪';
      case 'validacion_po':
      case 'po':
        return '✅';
      case 'finalizado':
      case 'done':
      case 'finished':
        return '🏁';
      default:
        return '•';
    }
  }

  private enrichCard(card: HuItem): BoardCardVm {
    return {
      ...card,
      statusClass: this.getCardStatusClass(card.status),
      statusLabel: this.getCardStatusLabel(card.status),
      statusIcon: this.getCardStatusIcon(card.status),
    };
  }

  private toHuItem(card: BoardCardVm): HuItem {
    return {
      hu: card.hu,
      descripcion: card.descripcion,
      status: card.status,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['project']) {
      return;
    }

    const sourceColumns = this.manageSmProjectsUseCase.buildColumns(this.project);
    this.columns = sourceColumns.map((column) => ({
      title: column.title,
      statusValue: column.statusValue,
      cards: column.cards.map((card) => this.enrichCard(card)),
    }));

    this.columns.forEach((column) => {
      if (!this.collapsedByStatus.has(column.statusValue)) {
        this.collapsedByStatus.set(column.statusValue, false);
      }
    });
  }

  onDrop(event: CdkDragDrop<BoardCardVm[]>, toStatus: string): void {
    if (!this.canEdit) {
      this.permissionMessage = 'Tu rol no tiene permisos para mover tarjetas.';
      return;
    }

    this.permissionMessage = '';

    const item = event.item.data as BoardCardVm | undefined;

    if (!item) {
      return;
    }

    const fromStatus = item.status;

    if (!this.canMoveBetweenStatuses(fromStatus, toStatus)) {
      this.permissionMessage = `No puedes mover una HU de ${this.getStatusLabel(fromStatus)} a ${this.getStatusLabel(toStatus)} con el rol ${this.projectRolePolicy.normalizeRole(this.userRole)}.`;
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

      event.container.data[event.currentIndex] = this.enrichCard({
        ...event.container.data[event.currentIndex],
        status: toStatus,
      });
    }

    const movedItem = event.container.data[event.currentIndex];

    if (!movedItem) {
      return;
    }

    this.huMoved.emit({
      item: this.toHuItem(movedItem),
      fromStatus,
      toStatus,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      sameColumn,
    });
  }

  private getStatusLabel(status: string): string {
    switch (this.projectRolePolicy.normalizeStatus(status)) {
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
}
