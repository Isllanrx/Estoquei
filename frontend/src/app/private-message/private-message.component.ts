import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface MessageUser {
  _id: string;
  nome: string;
  imagem: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  user: MessageUser;
  isEditing?: boolean;
  editedContent?: string;
  type: 'message' | 'alert' | 'info';
  destination: string;
}

@Component({
  selector: 'app-private-message',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './private-message.component.html',
  styleUrl: './private-message.component.css'
})
export class PrivateMessageComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private cdRef = inject(ChangeDetectorRef);

  messages: Message[] = [];
  users: User[] = [];
  selectedUser: User | null = null;
  newMessage: string = '';
  currentUser = this.authService.currentUser;
  userCache: { [key: string]: MessageUser } = {};
  private apiUrl = environment.apiUrl;
  @ViewChild('messageList') messageListRef!: ElementRef;
  isLoading: boolean = false;

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.loadUsers();
      }
    });
  }

  ngOnInit() {
    if (!this.authService.checkAuthStatus()) {
      this.authService.logout();
      return;
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageListRef && this.messageListRef.nativeElement) {
        this.messageListRef.nativeElement.scrollTop = this.messageListRef.nativeElement.scrollHeight;
      }
    }, 100);
  }

  loadUsers() {
    this.http.get<User[]>(`${this.apiUrl}/api/usuarios`).subscribe({
      next: (response) => {
        this.users = response.filter((user: User) => user._id !== this.currentUser()?._id);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        if (error.status === 401) {
          this.authService.logout();
        } else {
          alert('Erro ao carregar lista de usuários');
        }
      }
    });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.loadMessages(true);
  }

  async loadMessages(showLoading: boolean = false) {
    if (!this.selectedUser) return;
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/api/mensagens/private/${this.selectedUser._id}`)
      .subscribe({
        next: async (response) => {
          const messagesPromises = response.map(async (msg: any) => {
            const user = {
              _id: msg.autorId._id,
              nome: msg.autorId.nome,
              imagem: msg.autorId.imagem || '/images/padrao.png'
            };

            return {
              id: msg._id,
              content: msg.content,
              timestamp: new Date(msg.createdAt || msg.timestamp),
              user: user,
              type: msg.type || 'message',
              destination: msg.destination
            };
          });
          const allMessages = await Promise.all(messagesPromises);
          this.messages = allMessages.filter(m => m.content && m.content.trim() !== '');
          this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          this.scrollToBottom();
          this.cdRef.detectChanges();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          if (error.status === 401) {
            this.authService.logout();
          }
          alert('Erro ao carregar mensagens');
          this.isLoading = false;
        }
      });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return `${this.apiUrl}/images/padrao.png`;
    }
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${this.apiUrl}/${cleanPath}`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = `${this.apiUrl}/images/padrao.png`;
  }

  sendMessage() {
    const user = this.currentUser();
    if (this.newMessage.trim() && user?._id && this.selectedUser?._id) {
      const messageData = {
        texto: this.newMessage,
        autorId: user._id,
        type: 'message',
        destination: this.selectedUser._id
      };

      this.http.post<any>(`${this.apiUrl}/api/mensagens`, messageData)
        .subscribe({
          next: (response) => {
            const newMessage = {
              id: response._id,
              content: response.content,
              timestamp: new Date(response.createdAt || response.timestamp),
              user: {
                _id: response.autorId._id,
                nome: response.autorId.nome,
                imagem: response.autorId.imagem || '/images/padrao.png'
              },
              type: response.type || 'message',
              destination: response.destination
            };
            this.messages.push(newMessage);
            this.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            this.newMessage = '';
            this.scrollToBottom();
          },
          error: (error) => {
            console.error('Error sending message:', error);
            if (error.status === 401) {
              this.authService.logout();
            }
            alert('Erro ao enviar mensagem');
          }
        });
    }
  }

  goBack() {
    if (!this.selectedUser) {
      this.router.navigate(['/messages']);
      return;
    }
    this.selectedUser = null;
    this.messages = [];
    this.newMessage = '';
  }
}
