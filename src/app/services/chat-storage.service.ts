import { Injectable } from '@angular/core';
import { ChatDbService, Message, Contact, Group } from './chat-db.service';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatStorageService {

  constructor(private db: ChatDbService) {}


  async saveMessage(message: Message): Promise<number> {
    return await this.db.messages.add(message);
  }

  getMessagesByChat(chatId: string): Observable<Message[]> {
    const promise = this.db.messages
      .where('chatId').equals(chatId)
      .sortBy('timestamp');
      
    return from(promise);
  }


  async saveContact(contact: Contact): Promise<string> {
    return await this.db.contacts.put(contact); // 'put' atualiza ou insere
  }

  getAllContacts(): Observable<Contact[]> {
    return from(this.db.contacts.toArray());
  }


  async saveGroup(group: Group): Promise<string> {
    return await this.db.groups.put(group);
  }

  getGroup(groupId: string): Observable<Group | undefined> {
    return from(this.db.groups.get(groupId));
  }
}