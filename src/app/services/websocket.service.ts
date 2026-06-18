import { Injectable, inject, signal } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Message {
  id?: number;
  content: string;
  senderId: number;
  recipientId?: number;
  groupId?: number;
  timestamp?: string;
  senderName?: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private readonly authService = inject(AuthService);
  private client: Client | null = null;
  
  readonly isConnected = signal(false);
  readonly groupMessages = signal<Message[]>([]);
  readonly privateMessages = signal<Message[]>([]);
  
  private messageSubject = new Subject<Message>();
  public message$ = this.messageSubject.asObservable();

  connect(): Observable<void> {
    return new Observable(subscriber => {
      const token = this.authService.token();
      
      if (!token) {
        subscriber.error(new Error('Token não disponível'));
        return;
      }

      this.client = new Client({
        brokerURL: environment.websocketBrokerUrl,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.isConnected.set(true);
          this.subscribeToGroupMessages();
          this.subscribeToPrivateMessages();
          subscriber.next();
          subscriber.complete();
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          this.isConnected.set(false);
          subscriber.error(new Error('Erro na conexão STOMP'));
        }
      });

      this.client.activate();
    });
  }

  private subscribeToGroupMessages(): void {
    if (!this.client?.connected) return;

    this.client.subscribe('/topic/group.*', (message) => {
      const receivedMessage = JSON.parse(message.body) as Message;
      this.groupMessages.update(messages => [...messages, receivedMessage]);
      this.messageSubject.next(receivedMessage);
    });
  }

  private subscribeToPrivateMessages(): void {
    if (!this.client?.connected) return;

    this.client.subscribe('/user/queue/feed', (message) => {
      const receivedMessage = JSON.parse(message.body) as Message;
      this.privateMessages.update(messages => [...messages, receivedMessage]);
      this.messageSubject.next(receivedMessage);
    });
  }

  sendMessage(message: Message): void {
    if (!this.client?.connected) {
      console.error('WebSocket não conectado');
      return;
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
      headers: {}
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.isConnected.set(false);
    }
  }
}
