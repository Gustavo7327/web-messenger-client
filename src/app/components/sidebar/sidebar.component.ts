import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { ContactsService } from '../../services/contacts.service';
import { GroupService } from '../../services/group.service';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: () => number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly websocket = inject(WebSocketService);
  private readonly contactsService = inject(ContactsService);
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  protected readonly userEmail = this.auth.userEmail;
  protected readonly isConnected = this.websocket.isConnected;
  protected readonly contacts = this.contactsService.contacts;
  protected readonly groups = this.groupService.groups;
  protected readonly isSidebarOpen = signal(true);

  protected readonly navItems = computed<NavItem[]>(() => [
    {
      id: 'messages',
      label: 'Mensagens',
      icon: '💬',
      route: '/dashboard',
      badge: () => this.contacts().length + this.groups().length
    },
    {
      id: 'contacts',
      label: 'Contatos',
      icon: '👥',
      route: '/contacts',
      badge: () => this.contacts().length
    },
    {
      id: 'groups',
      label: 'Grupos',
      icon: '👨‍👩‍👧‍👦',
      route: '/groups',
      badge: () => this.groups().length
    },
    {
      id: 'senders',
      label: 'Remetentes',
      icon: '📤',
      route: '/senders'
    }
  ]);

  protected toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }

  protected logout(): void {
    this.auth.logout();
  }

  protected get currentRoute(): string {
    return this.router.url.split('?')[0];
  }

  protected isActive(route: string): boolean {
    return this.currentRoute === route;
  }
}
