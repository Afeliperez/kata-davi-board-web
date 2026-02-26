import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CheckSessionUseCase } from '../../../../application/use-cases/auth/check-session.use-case';
import { LoginUseCase } from '../../../../application/use-cases/auth/login.use-case';
import { ErrorMessageService } from '../../../shared/services/error-message.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly checkSessionUseCase = inject(CheckSessionUseCase);
  private readonly errorMessageService = inject(ErrorMessageService);
  loginError = '';

  readonly form = this.formBuilder.nonNullable.group({
    cc: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    if (this.checkSessionUseCase.execute()) {
      this.router.navigate(['/home']);
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
    ];

    const isCtrlOrMetaShortcut = (event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase());

    if (allowedKeys.includes(event.key) || isCtrlOrMetaShortcut) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizeCcInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericValue = input.value.replace(/\D/g, '');

    if (input.value !== numericValue) {
      this.form.controls.cc.setValue(numericValue);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loginError = '';

    this.loginUseCase.execute(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (error: HttpErrorResponse) => {
        const backendMessage = this.errorMessageService.extract(error);

        if (error.status === 401 || error.status === 400) {
          this.loginError =
            backendMessage ?? 'Credenciales inválidas. Verifica tu cédula y contraseña.';
          return;
        }

        this.loginError = backendMessage ?? 'No fue posible iniciar sesión. Inténtalo nuevamente.';
      },
    });
  }
}
