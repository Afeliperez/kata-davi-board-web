import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ManageSmProjectsUseCase } from '@application/use-cases/home/manage-sm-projects.use-case';
import { HomeProjectsFacade } from '@presentation/features/home/home/facades/home-projects.facade';

describe('HomeProjectsFacade', () => {
  const useCaseMock = {
    listProjects: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCaseMock.listProjects.mockReturnValue(of([]));
    useCaseMock.createProject.mockReturnValue(of(null));
    useCaseMock.updateProject.mockReturnValue(of(null));
    useCaseMock.deleteProject.mockReturnValue(of(null));

    TestBed.configureTestingModule({
      providers: [
        HomeProjectsFacade,
        { provide: ManageSmProjectsUseCase, useValue: useCaseMock },
      ],
    });
  });

  it('delegates project operations', () => {
    const facade = TestBed.inject(HomeProjectsFacade);
    facade.listProjects().subscribe();
    facade.createProject({} as never).subscribe();
    facade.updateProject('P1', {} as never).subscribe();
    facade.deleteProject('P1').subscribe();

    expect(useCaseMock.listProjects).toHaveBeenCalled();
    expect(useCaseMock.createProject).toHaveBeenCalled();
    expect(useCaseMock.updateProject).toHaveBeenCalledWith('P1', {});
    expect(useCaseMock.deleteProject).toHaveBeenCalledWith('P1');
  });

  it('filters projects by term', () => {
    const facade = TestBed.inject(HomeProjectsFacade);
    const projects = [
      { pro: 'P1', projectName: 'Alpha', hu: [], accesos: [] },
      { pro: 'P2', projectName: 'Beta', hu: [], accesos: [] },
    ] as never[];

    expect(facade.filterProjects(projects as never, '')).toHaveLength(2);
    expect(facade.filterProjects(projects as never, 'alpha')).toHaveLength(1);
  });

  it('maps payload to valid project list', () => {
    const facade = TestBed.inject(HomeProjectsFacade);
    expect(facade.projectsFromPayload(null)).toEqual([]);

    const payload = {
      data: [
        { pro: 'P1', projectName: 'X', hu: [], accesos: [] },
        { foo: 'bar' },
      ],
    } as never;

    expect(facade.projectsFromPayload(payload)).toEqual([
      { pro: 'P1', projectName: 'X', hu: [], accesos: [] },
    ]);
  });
});
