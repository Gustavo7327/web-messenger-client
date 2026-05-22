import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, EmailCodeRequest, VerifyCodeRequest } from '../../services/auth.service';

@Component({
  selector: 'verify-code-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyCodeComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pendingEmailMode = signal(false);
  protected readonly pendingEmail = signal<string | null>(null);

  protected readonly emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  protected readonly codeForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    code: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)])
  });

  constructor() {
    try {
      const e = sessionStorage.getItem('pending_verification_email');
      if (e) {
        this.pendingEmail.set(e);
        this.pendingEmailMode.set(true);
        this.codeForm.get('email')?.setValue(e);
        this.message.set(`Código enviado para ${e}. Verifique sua caixa de entrada.`);
      }
    } catch (err) {
      // ignore
    }
  }

  protected requestCode(): void {
    if (this.emailForm.invalid) {
      this.errorMessage.set('Digite um email válido para receber o código.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const payload = this.emailForm.value as EmailCodeRequest;

    this.auth.requestVerificationCode(payload).subscribe({
      next: () => {
        this.message.set('Código enviado. Confira sua caixa de entrada.');
      },
      error: () => {
        this.errorMessage.set('Não foi possível enviar o código. Verifique o email e tente novamente.');
      },
      complete: () => this.isLoading.set(false)
    });
  }

  protected resendCode(): void {
    const email = this.pendingEmail() ?? this.emailForm.value?.email;
    if (!email) {
      this.errorMessage.set('Email inválido para reenviar o código.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload: EmailCodeRequest = { email };
    this.auth.requestVerificationCode(payload).subscribe({
      next: () => {
        this.message.set('Código reenviado. Confira sua caixa de entrada.');
      },
      error: () => {
        this.errorMessage.set('Não foi possível reenviar o código.');
      },
      complete: () => this.isLoading.set(false)
    });
  }

  protected confirmCode(): void {
    if (this.codeForm.invalid) {
      this.errorMessage.set('Preencha o email e o código recebidos por email.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const payload = this.codeForm.value as VerifyCodeRequest;

    this.auth.verifyCode(payload).subscribe({
      next: () => {
        this.message.set('Código verificado com sucesso. Você já pode fazer login.');
        try {
          sessionStorage.removeItem('pending_verification_email');
        } catch {}
        this.router.navigate(['/login']);
      },
      error: () => {
        this.errorMessage.set('Código inválido ou expirado. Tente novamente.');
      },
      complete: () => this.isLoading.set(false)
    });
  }
}
