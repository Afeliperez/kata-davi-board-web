import { FormControl, FormGroup } from '@angular/forms';
import { AdminSectionComponent } from '@presentation/features/home/home/components/sections/admin-section/admin-section.component';

describe('AdminSectionComponent', () => {
  let component: AdminSectionComponent;

  beforeEach(() => {
    component = new AdminSectionComponent();
    component.createForm = new FormGroup({ a: new FormControl('') });
    component.editForm = new FormGroup({ b: new FormControl('') });
  });

  it('initializes expected defaults', () => {
    expect(component.sectionCollapsed).toBe(false);
    expect(component.filteredUsers).toEqual([]);
  });

  it('emits section actions', () => {
    const toggleSpy = jest.spyOn(component.toggleSection, 'emit');
    const createSpy = jest.spyOn(component.createUser, 'emit');
    component.toggleSection.emit();
    component.createUser.emit();
    expect(toggleSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalled();
  });
});
