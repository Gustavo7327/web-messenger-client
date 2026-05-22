import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.errorMessage.set('Preencha email e senha corretamente.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = this.form.value as LoginRequest;
    this.auth.login(payload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.errorMessage.set('Não foi possível autenticar. Verifique seus dados e tente novamente.');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }
}
