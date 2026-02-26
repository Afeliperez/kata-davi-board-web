import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectBoardSummary } from '../../../../../../../domain/ports/home-data-repository.port';

@Component({
  selector: 'app-project-catalog-section',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './project-catalog-section.component.html',
  styleUrl: './project-catalog-section.component.scss',
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
}
