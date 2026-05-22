import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.errorMessage.set('Preencha todos os campos corretamente.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = this.form.value as RegisterRequest;

    this.auth.register(payload).subscribe({
      next: () => {
        this.successMessage.set('Cadastrado com sucesso. Verifique seu email para o código de verificação.');
        try {
          if (payload && (payload as any).email) {
            sessionStorage.setItem('pending_verification_email', (payload as any).email);
          }
        } catch (e) {
          /* ignore */
        }
        this.router.navigate(['/verify']);
      },
      error: () => {
        this.errorMessage.set('Não foi possível concluir o registro. Tente novamente mais tarde.');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }
}
