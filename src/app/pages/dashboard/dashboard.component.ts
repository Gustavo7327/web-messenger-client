import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);

  protected readonly token = this.auth.token;
  protected readonly userEmail = this.auth.userEmail;
  protected readonly expiration = this.auth.tokenExpiration;

  protected logout(): void {
    this.auth.logout();
  }

  protected formatExpiration(): string {
    const expiresAt = this.expiration();
    if (!expiresAt || typeof expiresAt !== 'number') {
      return 'Informação não disponível';
    }
    const date = new Date(expiresAt * 1000);
    return date.toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
