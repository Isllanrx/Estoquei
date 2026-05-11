import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService, Message } from '../services/message.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  // UI State Signals
  newMessage = signal('');
  selectedMessageType = signal<'message' | 'alert' | 'info'>('message');
  editingMessageId = signal<string | null>(null);
  editedContent = signal('');
  
  // Dependency injection and state from services
  currentUser = this.authService.currentUser;
  messages = this.messageService.messages;
  
  // Computed Signal: Filter public messages
  publicMessages = computed(() => 
    this.messages().filter(msg => !msg.destination)
  );

  private apiUrl = environment.apiUrl;

  constructor() {}

  ngOnInit() {
    if (!this.authService.checkAuthStatus()) {
      this.authService.logout();
      return;
    }

    this.loadMessages();
  }

  loadMessages() {
    this.messageService.loadMessages().subscribe({
      error: (err) => {
        if (err.status === 401) this.authService.logout();
      }
    });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return `${this.apiUrl}/images/padrao.png`;
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${this.apiUrl}/${cleanPath}`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = `${this.apiUrl}/images/padrao.png`;
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (text) {
      this.messageService.sendMessage(text, this.selectedMessageType()).subscribe({
        next: () => this.newMessage.set(''),
        error: () => alert('Erro ao enviar mensagem')
      });
    }
  }

  startEdit(message: Message) {
    this.editingMessageId.set(message._id);
    this.editedContent.set(message.content);
  }

  cancelEdit() {
    this.editingMessageId.set(null);
    this.editedContent.set('');
  }

  saveEdit(message: Message) {
    const content = this.editedContent().trim();
    if (content) {
      this.messageService.updateMessage(message._id, content).subscribe({
        next: () => this.cancelEdit(),
        error: () => alert('Erro ao atualizar mensagem')
      });
    }
  }

  deleteMessage(message: Message) {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      this.messageService.deleteMessage(message._id).subscribe({
        error: () => alert('Erro ao excluir mensagem')
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
