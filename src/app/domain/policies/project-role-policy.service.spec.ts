import { ProjectRolePolicyService } from '@domain/policies/project-role-policy.service';

describe('ProjectRolePolicyService', () => {
  const service = new ProjectRolePolicyService();

  it('allows board edition for expected roles', () => {
    expect(service.canEditBoard('sm')).toBe(true);
    expect(service.canEditBoard('po')).toBe(true);
    expect(service.canEditBoard('admin')).toBe(false);
  });

  it('restricts HU section edition by role', () => {
    expect(service.canEditProjectHuSection('SCRUM')).toBe(true);
    expect(service.canEditProjectHuSection('DEV')).toBe(false);
  });

  it('evaluates drag permissions per role and status', () => {
    expect(service.canDragFromStatus('SM', 'backlog', true)).toBe(true);
    expect(service.canDragFromStatus('PO', 'validación po', true)).toBe(true);
    expect(service.canDragFromStatus('PO', 'test', true)).toBe(false);
    expect(service.canDragFromStatus('DEV', 'en curso', true)).toBe(true);
    expect(service.canDragFromStatus('QA', 'backlog', true)).toBe(false);
    expect(service.canDragFromStatus('SM', 'backlog', false)).toBe(false);
  });

  it('evaluates move permissions per role and transition', () => {
    expect(service.canMoveBetweenStatuses('SM', 'backlog', 'test', true)).toBe(true);
    expect(service.canMoveBetweenStatuses('PO', 'validación po', 'finalizado', true)).toBe(true);
    expect(service.canMoveBetweenStatuses('PO', 'test', 'finalizado', true)).toBe(false);
    expect(service.canMoveBetweenStatuses('DEV', 'por_hacer', 'test', true)).toBe(true);
    expect(service.canMoveBetweenStatuses('DEV', 'validacion_po', 'test', true)).toBe(false);
    expect(service.canMoveBetweenStatuses('QA', 'test', 'validacion_po', true)).toBe(true);
    expect(service.canMoveBetweenStatuses('QA', 'backlog', 'test', true)).toBe(false);
    expect(service.canMoveBetweenStatuses('SM', 'backlog', 'test', false)).toBe(false);
  });

  it('normalizes role and status values', () => {
    expect(service.normalizeRole('  dev ')).toBe('DEV');
    expect(service.normalizeStatus(' Validación PO ')).toBe('validacion_po');
    expect(service.isPo('po')).toBe(true);
    expect(service.isScrum('sm')).toBe(true);
    expect(service.isScrum('scrum')).toBe(true);
    expect(service.isScrum('qa')).toBe(false);
  });
});
