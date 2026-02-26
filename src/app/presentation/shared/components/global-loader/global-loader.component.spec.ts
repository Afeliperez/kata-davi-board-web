import { TestBed } from '@angular/core/testing';
import { GlobalLoaderComponent } from '@presentation/shared/components/global-loader/global-loader.component';
import { GlobalLoaderService } from '@presentation/shared/services/global-loader.service';

describe('GlobalLoaderComponent', () => {
  it('injects global loader service', async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoaderComponent],
      providers: [GlobalLoaderService],
    }).compileComponents();

    const fixture = TestBed.createComponent(GlobalLoaderComponent);
    expect(fixture.componentInstance.globalLoaderService).toBeTruthy();
  });
});
