import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForgotPasswordService } from '../../services/forgot-password.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly forgotPasswordService = inject(ForgotPasswordService);

  protected readonly step = signal<1 | 2>(1);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly email = signal('');

  protected readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  private passwordMatchValidator = (form: any) => {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  };

  protected readonly resetForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d+$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  protected requestPasswordReset() {
    if (this.emailForm.invalid) {
      this.markFormAsTouched(this.emailForm);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const email = this.emailForm.get('email')!.value as string;
    this.email.set(email);

    this.forgotPasswordService.requestPasswordReset(email).subscribe({
      next: () => {
        this.successMessage.set('Código de verificação enviado para seu email');
        this.step.set(2);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(this.getErrorMessage(err));
        this.isLoading.set(false);
      }
    });
  }

  protected resetPassword() {
    if (this.resetForm.invalid) {
      this.markFormAsTouched(this.resetForm);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const formValue = this.resetForm.value;
    this.forgotPasswordService.resetPassword({
      email: this.email(),
      code: formValue.code || '',
      newPassword: formValue.newPassword || ''
    }).subscribe({
      next: () => {
        this.successMessage.set('Senha redefinida com sucesso. Redirecionando para o login...');
        this.isLoading.set(false);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      },
      error: (err) => {
        this.error.set(this.getErrorMessage(err));
        this.isLoading.set(false);
      }
    });
  }

  protected goBackToEmailStep() {
    this.step.set(1);
    this.resetForm.reset();
    this.error.set(null);
    this.successMessage.set(null);
  }

  private markFormAsTouched(form: any) {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.status === 404) {
      return 'Email não encontrado no sistema';
    }
    if (error.status === 400) {
      return error.error?.message || 'Dados inválidos';
    }
    return 'Erro ao processar sua solicitação. Tente novamente.';
  }
}
