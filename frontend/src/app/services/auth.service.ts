import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  nome: string;
  email: string;
  imagem: string;
  token: string;
  admin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  // Refatoração para Signals
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.currentUserSignal()?.token);

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('userConnected');
      if (storedUser) {
        try {
          this.currentUserSignal.set(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('userConnected');
        }
      }
    }
  }

  login(email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuarios/login`, { email, password: senha })
      .pipe(
        tap((response: any) => {
          if (response.user && response.user.token) {
            this.setUser(response.user);
          }
        })
      );
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/usuarios`, userData);
  }

  private setUser(user: User) {
    if (this.isBrowser) {
      localStorage.setItem('userConnected', JSON.stringify(user));
    }
    this.currentUserSignal.set(user);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('userConnected');
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token || null;
  }

  // Deprecated: use isAuthenticated computed instead
  checkAuthStatus(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }

  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}
