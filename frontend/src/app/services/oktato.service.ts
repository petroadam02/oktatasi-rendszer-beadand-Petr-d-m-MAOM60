import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Oktato } from '../models/oktato.model';
import { Targy } from '../models/targy.model';

@Injectable({
  providedIn: 'root'
})
export class OktatoService {
  private apiUrl = 'http://localhost:3001/api/oktatok'; // A backend API URL-je

  constructor(private http: HttpClient) { }

  // Összes oktató lekérdezése
  getOktatok(): Observable<Oktato[]> {
    return this.http.get<Oktato[]>(this.apiUrl);
  }

  // Egy oktató lekérdezése ID alapján
  getOktatoById(id: number): Observable<Oktato> {
  return this.http.get<Oktato>(`${this.apiUrl}/${id}`);
  }

  // Új oktató létrehozása
  createOktato(oktato: { nev: string; tanszek?: string }): Observable<Oktato> {
    return this.http.post<Oktato>(this.apiUrl, oktato);
  }

  // Oktató frissítése
  updateOktato(id: number, oktato: Partial<Oktato>): Observable<Oktato> {
  return this.http.put<Oktato>(`${this.apiUrl}/${id}`, oktato);
  }

  // Oktató törlése
  deleteOktato(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOktatoTargyai(oktatoId: number): Observable<Targy[]> {
    return this.http.get<Targy[]>(`${this.apiUrl}/${oktatoId}/targyak`);
  }
}