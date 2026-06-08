import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const API_BASE = 'http://localhost:8080';

export interface GroupItem {
  id: number;
  name: string;
  description?: string;
  photoUrl?: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly http = inject(HttpClient);

  readonly groups = signal<GroupItem[]>([]);

  loadGroups(): Observable<GroupItem[]> {
    return this.http.get<GroupItem[]>(`${API_BASE}/api/groups`).pipe(
      tap((groups) => this.groups.set(groups))
    );
  }

  createGroup(payload: CreateGroupPayload): Observable<GroupItem> {
    return this.http.post<GroupItem>(`${API_BASE}/api/groups`, payload).pipe(
      tap((group) => this.groups.update((current) => [...current, group]))
    );
  }
}
