import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-scrum-management-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scrum-management-section.component.html',
  styleUrl: './scrum-management-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrumManagementSectionComponent {
  @Input() sectionCollapsed = false;
  @Input({ required: true }) createProjectForm!: FormGroup;
  @Input({ required: true }) createHuItemsControls!: FormArray;
  @Input({ required: true }) createAccessControls!: FormArray;
  @Input() projectStatuses: string[] = [];
  @Input() isLoadingProjects = false;
  @Input() scrumError = '';

  @Output() toggleSection = new EventEmitter<void>();
  @Output() createProject = new EventEmitter<void>();
  @Output() removeCreateHuItem = new EventEmitter<number>();
  @Output() addCreateHuItem = new EventEmitter<void>();
  @Output() removeCreateAccess = new EventEmitter<number>();
  @Output() addCreateAccess = new EventEmitter<void>();

  trackByIndex(index: number): number {
    return index;
  }

  getStatusIcon(status: string | null | undefined): string {
    switch (this.normalizeStatus(status)) {
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

  getStatusLabel(status: string | null | undefined): string {
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
        return status || 'Sin estado';
    }
  }

  getStatusClass(status: string | null | undefined): string {
    switch (this.normalizeStatus(status)) {
      case 'backlog':
        return 'status-backlog';
      case 'por_hacer':
      case 'todo':
        return 'status-por-hacer';
      case 'en_curso':
      case 'in_progress':
        return 'status-en-curso';
      case 'test':
      case 'testing':
        return 'status-test';
      case 'validacion_po':
      case 'po':
        return 'status-validacion-po';
      case 'finalizado':
      case 'done':
      case 'finished':
        return 'status-finalizado';
      default:
        return 'status-default';
    }
  }

  getStatusOptionLabel(status: string | null | undefined): string {
    return `${this.getStatusIcon(status)} ${this.getStatusLabel(status)}`;
  }

  private normalizeStatus(status: string | null | undefined): string {
    return (status || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  }
}
