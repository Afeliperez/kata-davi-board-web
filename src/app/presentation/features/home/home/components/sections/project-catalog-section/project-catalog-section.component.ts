import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectBoardSummary } from '@domain/ports/home-data-repository.port';

@Component({
  selector: 'app-project-catalog-section',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './project-catalog-section.component.html',
  styleUrl: './project-catalog-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCatalogSectionComponent {
  @Input() sectionCollapsed = false;
  @Input() projectSearchTerm = '';
  @Input() isLoadingProjects = false;
  @Input() isLoading = false;
  @Input() filteredProjects: ProjectBoardSummary[] = [];
  @Input() canEditProjectHu = false;
  @Input() isScrum = false;
  @Input() isPo = false;
  @Input() editingProjectPro: string | null = null;
  @Input({ required: true }) editProjectForm!: FormGroup;
  @Input({ required: true }) editAccessControls!: FormArray;
  @Input({ required: true }) huItemsControls!: FormArray;
  @Input() projectStatuses: string[] = [];

  @Output() toggleSection = new EventEmitter<void>();
  @Output() projectSearchTermChange = new EventEmitter<string>();
  @Output() viewProjectBoard = new EventEmitter<string>();
  @Output() startEditProject = new EventEmitter<ProjectBoardSummary>();
  @Output() deleteProject = new EventEmitter<string>();
  @Output() saveProject = new EventEmitter<void>();
  @Output() cancelEditProject = new EventEmitter<void>();
  @Output() removeEditAccess = new EventEmitter<number>();
  @Output() addEditAccess = new EventEmitter<void>();
  @Output() removeHuItem = new EventEmitter<number>();
  @Output() addHuItem = new EventEmitter<void>();

  trackByProject(_index: number, project: ProjectBoardSummary): string {
    return project.pro;
  }

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
