import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';


export interface AuthResponse {
  user: any;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password_hash: string; // A backend ezt a nevet várja a DTO-ban
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/auth';
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    // const token = this.getToken();
    // if (token) {
    //   // TODO: Token validálása és felhasználói adatok lekérése/beállítása
    // }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token && response.user) {
          localStorage.setItem('authToken', response.token);
          console.log('Sikeres bejelentkezés, token tárolva.');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
    console.log('Kijelentkezve.');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; 
  }

}