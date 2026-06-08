import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '../../services/websocket.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'senders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './senders.component.html',
  styleUrls: ['./senders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SendersComponent {
  private readonly websocket = inject(WebSocketService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly groupMessages = this.websocket.groupMessages;
  protected readonly searchQuery = signal('');

  protected readonly groupSenderIds = computed(() => {
    return Array.from(
      new Set(
        this.groupMessages()
          .filter((msg) => msg.groupId && msg.senderId != null)
          .map((msg) => msg.senderId)
      )
    );
  });

  protected readonly filteredSenders = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const senders = this.groupSenderIds();
    
    if (!query) return senders;
    
    return senders.filter(senderId => {
      const user = this.userService.getUser(senderId);
      const name = user?.name || `Usuário #${senderId}`;
      return name.toLowerCase().includes(query);
    });
  });

  protected openChatWith(senderId: number): void {
    this.userService.loadUser(senderId).subscribe({
      error: (err) => console.error('Falha ao carregar remetente:', err)
    });
    this.router.navigate(['/dashboard'], { queryParams: { userId: senderId } });
  }

  protected getSenderInfo(senderId: number): { name: string; id: number } {
    const user = this.userService.getUser(senderId);
    return {
      name: user?.name || `Usuário #${senderId}`,
      id: senderId
    };
  }
}


