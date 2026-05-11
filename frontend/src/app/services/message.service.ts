import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MessageAuthor {
  _id: string;
  nome: string;
  imagem: string;
}

export interface Message {
  _id: string;
  content: string;
  createdAt: string;
  autorId: MessageAuthor;
  type: 'message' | 'alert' | 'info';
  destination?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/api/mensagens`;
  
  // State management with Signals
  private messagesSignal = signal<Message[]>([]);
  public messages = this.messagesSignal.asReadonly();

  constructor(private http: HttpClient) {}

  loadMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl).pipe(
      tap(messages => this.messagesSignal.set(messages))
    );
  }

  sendMessage(content: string, type: 'message' | 'alert' | 'info' = 'message', destination?: string): Observable<Message> {
    const payload = { texto: content, type, destination };
    return this.http.post<Message>(this.apiUrl, payload).pipe(
      tap(newMessage => {
        this.messagesSignal.update(msgs => [newMessage, ...msgs]);
      })
    );
  }

  updateMessage(id: string, content: string): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${id}`, { content }).pipe(
      tap(updatedMessage => {
        this.messagesSignal.update(msgs => 
          msgs.map(m => m._id === id ? updatedMessage : m)
        );
      })
    );
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.messagesSignal.update(msgs => msgs.filter(m => m._id !== id));
      })
    );
  }

  loadPrivateMessages(userId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/private/${userId}`);
  }
}
