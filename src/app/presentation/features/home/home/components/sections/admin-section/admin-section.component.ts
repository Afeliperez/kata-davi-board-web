import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserSummary } from '../../../../../../../domain/ports/home-data-repository.port';

@Component({
  selector: 'app-admin-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-section.component.html',
  styleUrl: './admin-section.component.scss',
})
export class AdminSectionComponent {
  @Input() sectionCollapsed = false;
  @Input() isLoadingUsers = false;
  @Input() adminError = '';
  @Input() filteredUsers: UserSummary[] = [];
  @Input() editingCc: string | null = null;
  @Input() roleOptions: string[] = [];
  @Input({ required: true }) createForm!: FormGroup;
  @Input({ required: true }) editForm!: FormGroup;

  @Output() toggleSection = new EventEmitter<void>();
  @Output() createUser = new EventEmitter<void>();
  @Output() startEdit = new EventEmitter<UserSummary>();
  @Output() deleteUser = new EventEmitter<string>();
  @Output() saveEdit = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
}
