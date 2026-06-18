import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiUrl;

export interface EmailRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
  private readonly http = inject(HttpClient);

  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(
      `${API_BASE}/forgot-password/request`,
      { email }
    );
  }

  resetPassword(payload: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(
      `${API_BASE}/forgot-password`,
      payload
    );
  }
}
