import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalLoaderService } from '@presentation/shared/services/global-loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
})
export class GlobalLoaderComponent {
  readonly globalLoaderService = inject(GlobalLoaderService);
}
