import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Targy } from '../models/targy.model';

export interface CreateTargyDto { // Létrehozáshoz használt DTO
  nev: string;
  kod: string;
  kredit: number;
}

@Injectable({
  providedIn: 'root'
})
export class TargyService {
  private apiUrl = 'http://localhost:3001/api/targyak'; // Backend API URL a tárgyakhoz

  constructor(private http: HttpClient) { }

  getTargyak(): Observable<Targy[]> {
    return this.http.get<Targy[]>(this.apiUrl);
  }

  getTargyById(id: number): Observable<Targy> {
    return this.http.get<Targy>(`${this.apiUrl}/${id}`);
  }

  createTargy(targy: CreateTargyDto): Observable<Targy> {
    return this.http.post<Targy>(this.apiUrl, targy);
  }

  updateTargy(id: number, targy: Partial<CreateTargyDto>): Observable<Targy> {
    // A Partial<CreateTargyDto> itt azt jelenti, hogy nem minden mező kötelező a frissítéskor
    return this.http.put<Targy>(`${this.apiUrl}/${id}`, targy);
  }

  deleteTargy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}