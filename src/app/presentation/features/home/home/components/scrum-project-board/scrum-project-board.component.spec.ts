import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ManageSmProjectsUseCase } from '@application/use-cases/home/manage-sm-projects.use-case';
import { ProjectRolePolicyService } from '@domain/policies/project-role-policy.service';
import { ScrumProjectBoardComponent } from '@presentation/features/home/home/components/scrum-project-board/scrum-project-board.component';

describe('ScrumProjectBoardComponent', () => {
  const manageSmProjectsUseCaseMock = {
    buildColumns: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ScrumProjectBoardComponent],
      providers: [
        ProjectRolePolicyService,
        { provide: ManageSmProjectsUseCase, useValue: manageSmProjectsUseCaseMock },
      ],
    }).compileComponents();
  });

  const createDropEvent = (params: {
    previousData: Array<{ hu: string; descripcion: string; status: string; statusClass: string; statusLabel: string; statusIcon: string }>;
    currentData: Array<{ hu: string; descripcion: string; status: string; statusClass: string; statusLabel: string; statusIcon: string }>;
    previousIndex: number;
    currentIndex: number;
    itemData?: { hu: string; descripcion: string; status: string; statusClass: string; statusLabel: string; statusIcon: string };
    sameColumn?: boolean;
  }) => {
    const previousContainer = { data: params.previousData };
    const container = params.sameColumn ? previousContainer : { data: params.currentData };

    return {
      previousContainer,
      container,
      previousIndex: params.previousIndex,
      currentIndex: params.currentIndex,
      item: { data: params.itemData },
    } as unknown as CdkDragDrop<Array<{ hu: string; descripcion: string; status: string; statusClass: string; statusLabel: string; statusIcon: string }>>;
  };

  it('builds columns on project change', () => {
    manageSmProjectsUseCaseMock.buildColumns.mockReturnValue([
      {
        title: 'Backlog',
        statusValue: 'backlog',
        cards: [{ hu: 'HU-1', descripcion: 'Desc', status: 'backlog' }],
      },
    ]);

    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;

    component.ngOnChanges({
      project: new SimpleChange(null, { pro: 'P1', projectName: 'X', hu: [], accesos: [] }, true),
    });

    expect(component.columns).toHaveLength(1);
    expect(component.columns[0].cards[0].statusClass).toBe('card-status-backlog');
    expect(component.isColumnCollapsed('backlog')).toBe(false);
  });

  it('blocks drop when edition is disabled', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = false;

    const emitSpy = jest.spyOn(component.huMoved, 'emit');
    component.onDrop(createDropEvent({
      previousData: [],
      currentData: [],
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: true,
      itemData: undefined,
    }), 'test');

    expect(component.permissionMessage).toBe('Tu rol no tiene permisos para mover tarjetas.');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('blocks move when role has no permission for transition', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = true;
    component.userRole = 'PO';

    const card = {
      hu: 'HU-2',
      descripcion: 'Card',
      status: 'backlog',
      statusClass: 'x',
      statusLabel: 'Backlog',
      statusIcon: '•',
    };

    const emitSpy = jest.spyOn(component.huMoved, 'emit');
    component.onDrop(createDropEvent({
      previousData: [card],
      currentData: [card],
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
      itemData: card,
    }), 'test');

    expect(component.permissionMessage).toContain('No puedes mover una HU');
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('does not emit when dropping in same position', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = true;
    component.userRole = 'SM';

    const card = {
      hu: 'HU-3',
      descripcion: 'Card',
      status: 'backlog',
      statusClass: 'x',
      statusLabel: 'Backlog',
      statusIcon: '•',
    };

    const data = [card];
    const emitSpy = jest.spyOn(component.huMoved, 'emit');

    component.onDrop(createDropEvent({
      previousData: data,
      currentData: data,
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: true,
      itemData: card,
    }), 'backlog');

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('emits huMoved when reordering inside same column', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = true;
    component.userRole = 'SM';

    const cardA = {
      hu: 'HU-1',
      descripcion: 'A',
      status: 'backlog',
      statusClass: 'x',
      statusLabel: 'Backlog',
      statusIcon: '•',
    };
    const cardB = {
      hu: 'HU-2',
      descripcion: 'B',
      status: 'backlog',
      statusClass: 'x',
      statusLabel: 'Backlog',
      statusIcon: '•',
    };

    const data = [cardA, cardB];
    const emitSpy = jest.spyOn(component.huMoved, 'emit');

    component.onDrop(createDropEvent({
      previousData: data,
      currentData: data,
      previousIndex: 0,
      currentIndex: 1,
      sameColumn: true,
      itemData: cardA,
    }), 'backlog');

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        toStatus: 'backlog',
        sameColumn: true,
      }),
    );
  });

  it('updates card status and emits when moving across columns', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = true;
    component.userRole = 'SM';

    const card = {
      hu: 'HU-4',
      descripcion: 'Cross',
      status: 'backlog',
      statusClass: 'x',
      statusLabel: 'Backlog',
      statusIcon: '•',
    };

    const fromData = [card];
    const toData: typeof fromData = [];
    const emitSpy = jest.spyOn(component.huMoved, 'emit');

    component.onDrop(createDropEvent({
      previousData: fromData,
      currentData: toData,
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
      itemData: card,
    }), 'test');

    expect(toData[0].status).toBe('test');
    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fromStatus: 'backlog',
        toStatus: 'test',
        sameColumn: false,
      }),
    );
  });

  it('handles status helpers for all known states and default', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance as unknown as {
      getCardStatusClass: (value: string) => string;
      getCardStatusLabel: (value: string) => string;
      getCardStatusIcon: (value: string) => string;
      getStatusLabel: (value: string) => string;
    };

    const statuses = ['backlog', 'todo', 'in_progress', 'testing', 'po', 'done', 'otro'];
    statuses.forEach((status) => {
      expect(component.getCardStatusClass(status)).toBeTruthy();
      expect(component.getCardStatusLabel(status)).toBeTruthy();
      expect(component.getCardStatusIcon(status)).toBeTruthy();
      expect(component.getStatusLabel(status)).toBeTruthy();
    });
  });

  it('returns when drop item data is undefined', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = true;
    component.userRole = 'SM';
    const emitSpy = jest.spyOn(component.huMoved, 'emit');

    component.onDrop(createDropEvent({
      previousData: [],
      currentData: [],
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: true,
      itemData: undefined,
    }), 'test');

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('returns when moved item cannot be resolved after transfer', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = true;
    component.userRole = 'SM';
    const emitSpy = jest.spyOn(component.huMoved, 'emit');

    const previousData = [{ hu: '1', descripcion: 'A', status: 'backlog', statusClass: 'x', statusLabel: 'x', statusIcon: 'x' }];
    const currentData: typeof previousData = [];

    component.onDrop(createDropEvent({
      previousData,
      currentData,
      previousIndex: 0,
      currentIndex: 9,
      sameColumn: false,
      itemData: previousData[0],
    }), 'test');

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        toStatus: 'test',
        currentIndex: 9,
      }),
    );
  });

  it('ignores ngOnChanges when project did not change', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.columns = [{ title: 'x', statusValue: 'x', cards: [] }];
    component.ngOnChanges({} as never);
    expect(component.columns).toHaveLength(1);
  });

  it('toggles column collapsed state', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    expect(component.isColumnCollapsed('backlog')).toBe(false);
    component.toggleColumn('backlog');
    expect(component.isColumnCollapsed('backlog')).toBe(true);
  });

  it('exposes trackBy and permission wrappers', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.userRole = 'SM';
    component.canEdit = true;

    expect(component.trackByColumn(0, { title: 'Backlog', statusValue: 'backlog', cards: [] })).toBe('backlog');
    expect(component.trackByCard(0, {
      hu: 'HU-1',
      descripcion: 'Item',
      status: 'backlog',
      statusClass: 'x',
      statusLabel: 'Backlog',
      statusIcon: '•',
    })).toBe('HU-1-backlog-Item');

    expect(typeof component.canDragFromStatus('backlog')).toBe('boolean');
    expect(typeof component.canMoveBetweenStatuses('backlog', 'test')).toBe('boolean');
  });

  it('keeps collapsed state when status already exists on later ngOnChanges', () => {
    manageSmProjectsUseCaseMock.buildColumns
      .mockReturnValueOnce([
        { title: 'Backlog', statusValue: 'backlog', cards: [] },
      ])
      .mockReturnValueOnce([
        { title: 'Backlog', statusValue: 'backlog', cards: [] },
        { title: 'Test', statusValue: 'test', cards: [] },
      ]);

    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;

    component.ngOnChanges({
      project: new SimpleChange(null, { pro: 'P1', projectName: 'X', hu: [], accesos: [] }, true),
    });
    component.toggleColumn('backlog');

    component.ngOnChanges({
      project: new SimpleChange({ pro: 'P1' }, { pro: 'P1', projectName: 'X', hu: [], accesos: [] }, false),
    });

    expect(component.isColumnCollapsed('backlog')).toBe(true);
    expect(component.isColumnCollapsed('test')).toBe(false);
  });

  it('uses fallback status labels in permission message for unknown statuses', () => {
    const fixture = TestBed.createComponent(ScrumProjectBoardComponent);
    const component = fixture.componentInstance;
    component.canEdit = true;
    component.userRole = 'PO';

    const card = {
      hu: 'HU-X',
      descripcion: 'Card',
      status: 'estado-raro',
      statusClass: 'x',
      statusLabel: 'x',
      statusIcon: '•',
    };

    component.onDrop(createDropEvent({
      previousData: [card],
      currentData: [],
      previousIndex: 0,
      currentIndex: 0,
      sameColumn: false,
      itemData: card,
    }), 'destino-raro');

    expect(component.permissionMessage).toContain('estado-raro');
    expect(component.permissionMessage).toContain('destino-raro');
  });
});
