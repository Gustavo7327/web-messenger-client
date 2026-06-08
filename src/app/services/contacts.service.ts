import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const API_BASE = 'http://localhost:8080';

export interface ContactItem {
  id: number;
  username: string;
  nickname: string;
  createdAt: string;
}

export interface CreateContactPayload {
  username: string;
  nickname: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly http = inject(HttpClient);

  readonly contacts = signal<ContactItem[]>([]);

  loadContacts(): Observable<ContactItem[]> {
    return this.http.get<ContactItem[]>(`${API_BASE}/api/contacts`).pipe(
      tap((contacts) => this.contacts.set(contacts))
    );
  }

  createContact(payload: CreateContactPayload): Observable<ContactItem> {
    return this.http.post<ContactItem>(`${API_BASE}/api/contacts`, payload).pipe(
      tap((contact) => this.contacts.update((current) => [...current, contact]))
    );
  }
}
