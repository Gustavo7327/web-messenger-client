import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

const API_BASE = 'http://localhost:8080';

export interface UserModel {
  id: number;
  name: string;
  username: string;
  bio?: string;
  photoUrl?: string;
  profileLinks?: unknown[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  readonly userCache = signal<Record<number, UserModel>>({});

  getUser(id: number): UserModel | undefined {
    return this.userCache()[id];
  }

  loadUser(id: number): Observable<UserModel> {
    const existing = this.getUser(id);

    if (existing) {
      return of(existing);
    }

    return this.http.get<Omit<UserModel, 'id'>>(`${API_BASE}/api/users/${id}`).pipe(
      map((user) => ({ ...user, id } as UserModel)),
      tap((user) => {
        this.userCache.update((current) => ({
          ...current,
          [id]: user
        }));
      })
    );
  }
}
