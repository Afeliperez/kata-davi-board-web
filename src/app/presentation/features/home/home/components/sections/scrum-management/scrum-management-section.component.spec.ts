import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ScrumManagementSectionComponent } from '@presentation/features/home/home/components/sections/scrum-management/scrum-management-section.component';

describe('ScrumManagementSectionComponent', () => {
  let component: ScrumManagementSectionComponent;

  beforeEach(() => {
    component = new ScrumManagementSectionComponent();
    component.createProjectForm = new FormGroup({});
    component.createHuItemsControls = new FormArray<FormControl>([]);
    component.createAccessControls = new FormArray<FormControl>([]);
  });

  it('tracks index', () => {
    expect(component.trackByIndex(3)).toBe(3);
  });

  it('returns status metadata for known and unknown values', () => {
    const matrix = [
      ['backlog', '🗂️', 'Backlog', 'status-backlog'],
      ['por_hacer', '📌', 'Por hacer', 'status-por-hacer'],
      ['por hacer', '📌', 'Por hacer', 'status-por-hacer'],
      ['todo', '📌', 'Por hacer', 'status-por-hacer'],
      ['en_curso', '⚙️', 'En curso', 'status-en-curso'],
      ['in_progress', '⚙️', 'En curso', 'status-en-curso'],
      ['test', '🧪', 'Test', 'status-test'],
      ['testing', '🧪', 'Test', 'status-test'],
      ['validacion_po', '✅', 'Validación PO', 'status-validacion-po'],
      ['validación po', '✅', 'Validación PO', 'status-validacion-po'],
      ['finalizado', '🏁', 'Finalizado', 'status-finalizado'],
      ['done', '🏁', 'Finalizado', 'status-finalizado'],
      ['finished', '🏁', 'Finalizado', 'status-finalizado'],
      ['otro', '•', 'otro', 'status-default'],
    ] as const;

    matrix.forEach(([status, icon, label, css]) => {
      expect(component.getStatusIcon(status)).toBe(icon);
      expect(component.getStatusLabel(status)).toBe(label);
      expect(component.getStatusClass(status)).toBe(css);
      expect(component.getStatusOptionLabel(status)).toContain(label);
    });

    expect(component.getStatusIcon(undefined)).toBe('•');
    expect(component.getStatusLabel(undefined)).toBe('Sin estado');
    expect(component.getStatusClass(undefined)).toBe('status-default');
  });
});
