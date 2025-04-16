import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Chat } from '../models/chat';
import { Message } from '../models/message';
import { ChatService } from '../services/chat.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  chatForm: FormGroup;
  chatObj: Chat = new Chat();
  messageObj: Message = new Message();
  messageList: any = [];
  public chatList: any = [];
  replymessage: String = "checking";
  public chatData: any;
  msg = "Good work";
  chatId: number | null = null;
  color = "";
  secondUserName = "";
  public alluser: any = [];
  check = sessionStorage.getItem('username');
  timesRun = 0;
  timesRun2 = 0;

  firstUserName = sessionStorage.getItem('username');
  senderEmail = sessionStorage.getItem('username');
  senderCheck = sessionStorage.getItem('username');

  constructor(private chatService: ChatService, private router: Router, private userService: UserService) {
    this.chatForm = new FormGroup({
      replymessage: new FormControl()
    });
  }

  ngOnInit(): void {
    // Initialize chatId from sessionStorage
    const storedChatId = sessionStorage.getItem('chatId');
    if (storedChatId) {
      this.chatId = parseInt(storedChatId, 10);
      if (!isNaN(this.chatId)) {
        this.startChatPolling();
      }
    }

    let getByname = setInterval(() => {
      // For getting all the chat list whose ever is logged in.
      this.chatService.getChatByFirstUserNameOrSecondUserName(sessionStorage.getItem('username')).subscribe(data => {
        this.chatData = data;
        this.chatList = this.chatData;
      });

      this.timesRun2 += 1;
      if (this.timesRun2 === 2) {
        clearInterval(getByname);
      }
    }, 1000);

    let all = setInterval(() => {
      this.userService.getAll().subscribe((data) => {
        this.alluser = data;
      });

      this.timesRun += 1;
      if (this.timesRun === 2) {
        clearInterval(all);
      }
    }, 1000);
  }

  private startChatPolling() {
    if (!this.chatId) {
      console.warn('Cannot start polling: chatId is not set');
      return;
    }

    setInterval(() => {
      this.chatService.getChatById(this.chatId!).subscribe({
        next: (data) => {
          console.log('Polling update - Chat data:', JSON.stringify(data));
          console.log('Current messageList length:', data.messageList?.length || 0);
          this.chatData = data;
          this.messageList = data.messageList || [];
          this.secondUserName = data.secondUserName;
          this.firstUserName = data.firstUserName;
        },
        error: (error) => {
          console.error('Error fetching chat:', error);
        }
      });
    }, 1000);
  }

  loadChatByEmail(event: string, event1: string) {
    console.log('Loading chat for users:', event, event1);
    sessionStorage.removeItem("chatId");
    this.chatId = null;

    this.chatService.getChatByFirstUserNameAndSecondUserName(event, event1).subscribe({
      next: (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          this.chatData = data;
          const newChatId = Number(data[0].chatId);
          if (!isNaN(newChatId)) {
            this.chatId = newChatId;
            console.log('New chatId:', this.chatId);
            sessionStorage.setItem('chatId', this.chatId.toString());
            this.startChatPolling();
          }
        } else {
          console.warn('No chat found for users:', event, event1);
        }
      },
      error: (error) => {
        console.error('Error loading chat:', error);
      }
    });
  }

  sendMessage() {
    if (!this.chatId) {
      console.error('Cannot send message: chatId is not set');
      return;
    }

    if (!this.chatForm.value.replymessage?.trim()) {
      return;
    }

    console.log('Sending message to chatId:', this.chatId);
    this.messageObj.replymessage = this.chatForm.value.replymessage;
    this.messageObj.senderEmail = this.senderEmail;
    this.messageObj.time = new Date().toISOString();

    this.chatService.updateChat(this.messageObj, this.chatId).subscribe({
      next: (data) => {
        console.log('Message sent successfully');
        this.chatForm.reset();
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  routeX() {
    // this.router.navigateByUrl('/navbar/recommendation-service');
    sessionStorage.clear();
    // window.location.reload();
    this.router.navigateByUrl('');
  }

  routeHome() {
    this.router.navigateByUrl('');
  }

  goToChat(username: string) {
    const currentUser = sessionStorage.getItem("username");
    if (!currentUser) {
      console.error('No current user found');
      return;
    }

    this.chatService.getChatByFirstUserNameAndSecondUserName(username, currentUser).subscribe({
      next: (chats) => {
        if (chats && chats.length > 0) {
          // Get the first chat from the array
          const chat = chats[0];
          const chatId = Number(chat.chatId);
          if (!isNaN(chatId)) {
            this.chatId = chatId;
            this.secondUserName = username;
            sessionStorage.setItem("chatId", this.chatId.toString());
            console.log('Chat loaded successfully with ID:', this.chatId);
            this.startChatPolling();
          }
        } else {
          // If no chat exists, create a new one
          console.log('No existing chat found, creating new chat');
          this.chatObj.firstUserName = currentUser;
          this.chatObj.secondUserName = username;
          this.secondUserName = username;
          
          this.chatService.createChatRoom(this.chatObj).subscribe({
            next: (newChat) => {
              this.chatData = newChat;
              const newChatId = Number((newChat as Chat).chatId);
              if (!isNaN(newChatId)) {
                this.chatId = newChatId;
                sessionStorage.setItem("chatId", this.chatId.toString());
                console.log('New chat created with ID:', this.chatId);
                this.startChatPolling();
              }
            },
            error: (error) => {
              console.error('Error creating new chat:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading chat:', error);
      }
    });
  }
}
