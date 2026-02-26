import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-header.component.html',
  styleUrl: './home-header.component.scss',
})
export class HomeHeaderComponent {
  @Input() role = '';
  @Output() logoutRequested = new EventEmitter<void>();
  @Input() searchTerm = '';
  @Output() searchChanged = new EventEmitter<string>();

  get isAdmin(): boolean {
    return this.role.toUpperCase() === 'ADMIN';
  }

  requestLogout(): void {
    this.logoutRequested.emit();
  }

  onSearchChange(value: string): void {
    this.searchChanged.emit(value);
  }
}
