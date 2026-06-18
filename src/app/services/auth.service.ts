import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiUrl;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expirationTime: number;
}

export interface JwtPayload {
  sub?: string;
  exp?: number;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface EmailCodeRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem('webmessenger_token'));
  readonly isAuthenticated = computed(() => !!this.token());
  readonly userEmail = computed(() => this.decodeToken(this.token() ?? '')?.sub ?? null);
  readonly tokenExpiration = computed(() => this.decodeToken(this.token() ?? '')?.exp ?? null);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE}/login`, payload).pipe(
      tap((response) => this.setToken(response.token))
    );
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${API_BASE}/register`, payload);
  }

  requestVerificationCode(payload: EmailCodeRequest): Observable<void> {
    return this.http.post<void>(`${API_BASE}/verify-email/request`, payload);
  }

  verifyCode(payload: VerifyCodeRequest): Observable<void> {
    return this.http.post<void>(`${API_BASE}/verify-email`, payload);
  }

  logout(): void {
    localStorage.removeItem('webmessenger_token');
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  private setToken(token: string): void {
    localStorage.setItem('webmessenger_token', token);
    this.token.set(token);
  }

  private decodeToken(token: string): JwtPayload | null {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
