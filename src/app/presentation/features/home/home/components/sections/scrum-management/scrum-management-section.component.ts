import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-scrum-management-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scrum-management-section.component.html',
  styleUrl: './scrum-management-section.component.scss',
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
}
