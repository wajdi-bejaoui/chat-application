import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat } from '../models/chat';
import { Message } from '../models/message';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  baseUrl = "http://localhost:8080";

  constructor(private httpClient: HttpClient) { }

  updateChat(message: Message, chatId: number): Observable<Object> {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    console.log("Updating chat with ID:", chatId);
    console.log("Message content:", message.replymessage);

    return this.httpClient.put(`${this.baseUrl}/chats/message/${chatId}`, message);
  }

  getChatById(chatId: number) {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }
    console.log("Fetching chat with ID:", chatId);
    return this.httpClient.get<Chat>(`${this.baseUrl}/chats/mess/${chatId}`);
  }

  createChatRoom(chat: Chat): Observable<Object> {
    return this.httpClient.post(`${this.baseUrl}/chats/add`, chat);
  }

  getChatByFirstUserNameAndSecondUserName(firstUserName: string, secondUserName: string): Observable<Chat[]> {
    return this.httpClient.get<Chat[]>(`${this.baseUrl}/chats/getChatByFirstUserNameAndSecondUserName?firstUserName=${firstUserName}&secondUserName=${secondUserName}`);
  }

  getChatByFirstUserNameOrSecondUserName(username: string): Observable<Chat[]> {
    return this.httpClient.get<Chat[]>(`${this.baseUrl}/chats/getChatByFirstUserNameOrSecondUserName/${username}`);
  }
}
