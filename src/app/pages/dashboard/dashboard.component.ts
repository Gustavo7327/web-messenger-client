import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService, Message } from '../../services/websocket.service';
import { ContactsService } from '../../services/contacts.service';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly websocket = inject(WebSocketService);
  private readonly contactsService = inject(ContactsService);
  private readonly groupService = inject(GroupService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private querySub?: Subscription;

  protected readonly isConnected = this.websocket.isConnected;
  protected readonly groupMessages = this.websocket.groupMessages;
  protected readonly privateMessages = this.websocket.privateMessages;
  protected readonly contacts = this.contactsService.contacts;
  protected readonly groups = this.groupService.groups;

  protected readonly messageContent = signal('');
  protected readonly selectedGroupId = signal<number | null>(null);
  protected readonly selectedChatUserId = signal<number | null>(null);
  protected readonly messagesByGroup = computed(() => {
    const messages = this.groupMessages();
    const grouped: Record<number, Message[]> = {};

    messages.forEach((msg) => {
      if (msg.groupId) {
        grouped[msg.groupId] = grouped[msg.groupId] ?? [];
        grouped[msg.groupId].push(msg);
      }
    });

    return grouped;
  });

  protected readonly selectedUserProfile = computed(() => {
    const userId = this.selectedChatUserId();
    if (!userId) {
      return null;
    }
    return this.userService.getUser(userId) ?? null;
  });

  protected readonly activeGroupMessages = computed(() => {
    const groupId = this.selectedGroupId();
    if (!groupId) {
      return [] as Message[];
    }
    return this.messagesByGroup()[groupId] ?? [];
  });

  protected readonly activePrivateMessages = computed(() => {
    const userId = this.selectedChatUserId();
    if (!userId) {
      return [] as Message[];
    }
    return this.privateMessages().filter(
      (msg) => msg.senderId === userId || msg.recipientId === userId
    );
  });

  ngOnInit(): void {
    this.websocket.connect().subscribe({
      next: () => console.log('WebSocket conectado'),
      error: (err) => console.error('Erro ao conectar WebSocket:', err)
    });

    this.contactsService.loadContacts().subscribe({
      error: (err) => console.error('Falha ao buscar contatos:', err)
    });

    this.groupService.loadGroups().subscribe({
      error: (err) => console.error('Falha ao buscar grupos:', err)
    });

    this.querySub = this.route.queryParams.subscribe((params) => {
      if (params['userId']) {
        const userId = Number(params['userId']);
        this.selectedChatUserId.set(userId);
        this.userService.loadUser(userId).subscribe({
          error: (err) => console.error('Falha ao carregar usuário via rota:', err)
        });
      }
      if (params['groupId']) {
        this.selectedGroupId.set(Number(params['groupId']));
      }
    });
  }

  ngOnDestroy(): void {
    this.websocket.disconnect();
    this.querySub?.unsubscribe();
  }

  protected selectGroup(groupId: number): void {
    this.selectedChatUserId.set(null);
    this.selectedGroupId.set(this.selectedGroupId() === groupId ? null : groupId);
  }

  protected selectContact(userId: number): void {
    this.selectedGroupId.set(null);
    this.selectedChatUserId.set(this.selectedChatUserId() === userId ? null : userId);
    if (this.selectedChatUserId() === userId) {
      this.userService.loadUser(userId).subscribe({
        error: (err) => console.error('Falha ao carregar usuário:', err)
      });
    }
  }

  protected sendMessage(): void {
    const content = this.messageContent().trim();
    if (!content) {
      return;
    }

    const message: Message = {
      content,
      senderId: 0
    };

    if (this.selectedGroupId()) {
      message.groupId = this.selectedGroupId()!;
    } else if (this.selectedChatUserId()) {
      message.recipientId = this.selectedChatUserId()!;
    } else {
      return;
    }

    this.websocket.sendMessage(message);
    this.messageContent.set('');
  }

  protected getGroupName(groupId: number): string {
    return this.groups().find((group) => group.id === groupId)?.name ?? `Grupo #${groupId}`;
  }
}
