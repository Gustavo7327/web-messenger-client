import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactsService } from '../../services/contacts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'contacts-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactsComponent {
  private readonly contactsService = inject(ContactsService);
  private readonly router = inject(Router);

  protected readonly contacts = this.contactsService.contacts;
  protected readonly newContactUsername = signal('');
  protected readonly newContactNickname = signal('');
  protected readonly searchQuery = signal('');
  protected readonly showForm = signal(false);

  protected readonly filteredContacts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.contacts();
    
    return this.contacts().filter(contact =>
      contact.nickname.toLowerCase().includes(query) ||
      contact.username.toLowerCase().includes(query)
    );
  });

  protected createContact(): void {
    const payload = {
      username: this.newContactUsername().trim(),
      nickname: this.newContactNickname().trim()
    };

    if (!payload.username || !payload.nickname) return;

    this.contactsService.createContact(payload).subscribe({
      next: () => {
        this.newContactUsername.set('');
        this.newContactNickname.set('');
        this.showForm.set(false);
      },
      error: (err) => console.error('Falha ao criar contato:', err)
    });
  }

  protected openChatWith(userId: number): void {
    this.router.navigate(['/dashboard'], { queryParams: { userId } });
  }

  protected deleteContact(contactId: number): void {
    if (confirm('Tem certeza que deseja deletar este contato?')) {
      console.log('Deletar contato:', contactId);
    }
  }

  protected editContact(contactId: number): void {
    console.log('Editar contato:', contactId);
  }
}

