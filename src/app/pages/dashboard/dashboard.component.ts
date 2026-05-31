import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { WebSocketService, Message } from '../../services/websocket.service';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly websocket = inject(WebSocketService);

  protected readonly userEmail = this.auth.userEmail;
  protected readonly isConnected = this.websocket.isConnected;
  protected readonly groupMessages = this.websocket.groupMessages;
  protected readonly privateMessages = this.websocket.privateMessages;

  protected readonly messageContent = signal('');
  protected readonly selectedTab = signal<'groups' | 'private'>('groups');
  protected readonly recipientId = signal<number | null>(null);
  protected readonly groupId = signal<number | null>(null);

  protected readonly messagesByGroup = computed(() => {
    const messages = this.groupMessages();
    const grouped: { [key: number]: Message[] } = {};
    
    messages.forEach(msg => {
      if (msg.groupId) {
        if (!grouped[msg.groupId]) {
          grouped[msg.groupId] = [];
        }
        grouped[msg.groupId].push(msg);
      }
    });
    
    return grouped;
  });

  protected readonly groupIds = computed(() => {
    return Object.keys(this.messagesByGroup())
      .map(Number)
      .sort((a, b) => b - a);
  });

  ngOnInit(): void {
    this.websocket.connect().subscribe({
      next: () => console.log('WebSocket conectado'),
      error: (err) => console.error('Erro ao conectar WebSocket:', err)
    });
  }

  ngOnDestroy(): void {
    this.websocket.disconnect();
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

    if (this.selectedTab() === 'groups' && this.groupId()) {
      message.groupId = this.groupId()!;
    } else if (this.selectedTab() === 'private' && this.recipientId()) {
      message.recipientId = this.recipientId()!;
    } else {
      alert('Selecione um destinatário ou grupo');
      return;
    }

    this.websocket.sendMessage(message);
    this.messageContent.set('');
  }

  protected selectGroup(groupId: number): void {
    this.groupId.set(this.groupId() === groupId ? null : groupId);
  }

  protected selectPrivateChat(userId: number): void {
    this.recipientId.set(this.recipientId() === userId ? null : userId);
  }

  protected logout(): void {
    this.auth.logout();
  }
}
