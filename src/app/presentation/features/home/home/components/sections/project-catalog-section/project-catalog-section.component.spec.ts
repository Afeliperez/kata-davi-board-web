import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProjectCatalogSectionComponent } from '@presentation/features/home/home/components/sections/project-catalog-section/project-catalog-section.component';

describe('ProjectCatalogSectionComponent', () => {
  let component: ProjectCatalogSectionComponent;

  beforeEach(() => {
    component = new ProjectCatalogSectionComponent();
    component.editProjectForm = new FormGroup({});
    component.editAccessControls = new FormArray<FormControl>([]);
    component.huItemsControls = new FormArray<FormControl>([]);
  });

  it('tracks project and index', () => {
    expect(component.trackByProject(0, { pro: 'P1' } as never)).toBe('P1');
    expect(component.trackByIndex(2)).toBe(2);
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

    expect(component.getStatusIcon(null)).toBe('•');
    expect(component.getStatusLabel(undefined)).toBe('Sin estado');
    expect(component.getStatusClass(undefined)).toBe('status-default');
  });
});
