import { HomeHeaderComponent } from '@presentation/features/home/home/components/home-header/home-header.component';

describe('HomeHeaderComponent', () => {
  let component: HomeHeaderComponent;

  beforeEach(() => {
    component = new HomeHeaderComponent();
  });

  it('detects admin role', () => {
    component.role = 'admin';
    expect(component.isAdmin).toBe(true);
  });

  it('emits logout event', () => {
    const emitSpy = jest.spyOn(component.logoutRequested, 'emit');
    component.requestLogout();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('emits search change', () => {
    const emitSpy = jest.spyOn(component.searchChanged, 'emit');
    component.onSearchChange('abc');
    expect(emitSpy).toHaveBeenCalledWith('abc');
  });
});
