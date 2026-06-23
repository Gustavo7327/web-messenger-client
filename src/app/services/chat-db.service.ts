import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface Message {
  id?: number; 
  chatId: string; 
  senderId: string;
  text: string;
  timestamp: number;
  synced: boolean; 
}

export interface Contact {
  id: string;
  name: string;
  avatarUrl: string;
  lastSeen: number;
}

export interface Group {
  id: string;
  name: string;
  members: string[]; 
}

@Injectable({
  providedIn: 'root'
})
export class ChatDbService extends Dexie {
  messages!: Table<Message, number>;
  contacts!: Table<Contact, string>;
  groups!: Table<Group, string>;

  constructor() {
    super('ChatDatabase');
    
    this.version(1).stores({
      messages: '++id, chatId, senderId, timestamp, synced',
      contacts: '&id, name',
      groups: '&id, name'
    });
  }
}