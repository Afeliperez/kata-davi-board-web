import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HOME_DATA_REPOSITORY } from '@domain/ports/home-data-repository.port';
import { ManageSmProjectsUseCase } from '@application/use-cases/home/manage-sm-projects.use-case';

describe('ManageSmProjectsUseCase', () => {
  const repositoryMock = {
    getProjectBoards: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [ManageSmProjectsUseCase, { provide: HOME_DATA_REPOSITORY, useValue: repositoryMock }],
    });
  });

  it('normalizes list projects payload to array', (done) => {
    repositoryMock.getProjectBoards.mockReturnValue(of({ endpoint: '/boards', data: { data: { pro: 'P1' } } }));
    const useCase = TestBed.inject(ManageSmProjectsUseCase);
    useCase.listProjects().subscribe({
      next: (projects) => {
        expect(projects).toEqual([{ pro: 'P1' }]);
        done();
      },
      error: done,
    });
  });

  it('keeps projects payload when it is already an array', (done) => {
    repositoryMock.getProjectBoards.mockReturnValue(of({ endpoint: '/boards', data: { data: [{ pro: 'P1' }] } }));
    const useCase = TestBed.inject(ManageSmProjectsUseCase);
    useCase.listProjects().subscribe({
      next: (projects) => {
        expect(projects).toEqual([{ pro: 'P1' }]);
        done();
      },
      error: done,
    });
  });

  it('delegates create/update/delete operations', () => {
    repositoryMock.createProject.mockReturnValue(of(null));
    repositoryMock.updateProject.mockReturnValue(of(null));
    repositoryMock.deleteProject.mockReturnValue(of(null));

    const useCase = TestBed.inject(ManageSmProjectsUseCase);
    useCase.createProject({} as never).subscribe();
    useCase.updateProject('P1', {} as never).subscribe();
    useCase.deleteProject('P1').subscribe();

    expect(repositoryMock.createProject).toHaveBeenCalled();
    expect(repositoryMock.updateProject).toHaveBeenCalledWith('P1', {});
    expect(repositoryMock.deleteProject).toHaveBeenCalledWith('P1');
  });

  it('builds status columns including normalized statuses', () => {
    const useCase = TestBed.inject(ManageSmProjectsUseCase);
    const columns = useCase.buildColumns({
      pro: 'P1',
      projectName: 'Project',
      accesos: [],
      hu: [
        { hu: '1', descripcion: 'a', status: 'Backlog' },
        { hu: '2', descripcion: 'b', status: 'Por Hacer' },
        { hu: '3', descripcion: 'c', status: 'in progress' },
        { hu: '4', descripcion: 'd', status: 'Testing' },
        { hu: '5', descripcion: 'e', status: 'validación po' },
        { hu: '6', descripcion: 'f', status: 'done' },
      ],
    });

    expect(columns).toHaveLength(6);
    expect(columns[0].cards).toHaveLength(1);
    expect(columns[1].cards).toHaveLength(1);
    expect(columns[2].cards).toHaveLength(1);
    expect(columns[3].cards).toHaveLength(1);
    expect(columns[4].cards).toHaveLength(1);
    expect(columns[5].cards).toHaveLength(1);
  });
});
