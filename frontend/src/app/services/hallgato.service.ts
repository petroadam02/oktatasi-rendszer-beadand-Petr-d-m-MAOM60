import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hallgato } from '../models/hallgato.model';

@Injectable({
  providedIn: 'root'
})
export class HallgatoService {
  private apiUrl = 'http://localhost:3001/api/hallgatok'; // Backend API URL a hallgatókhoz

  constructor(private http: HttpClient) { }

  getHallgatok(): Observable<Hallgato[]> {
    return this.http.get<Hallgato[]>(this.apiUrl);
  }

  getHallgatoById(id: number): Observable<Hallgato> {
    return this.http.get<Hallgato>(`${this.apiUrl}/${id}`);
  }

  createHallgato(hallgato: { nev: string; tritonKod: string; email: string; tankor: string }): Observable<Hallgato> {
  return this.http.post<Hallgato>(this.apiUrl, hallgato);
  }

  updateHallgato(id: number, hallgato: Partial<Hallgato>): Observable<Hallgato> {
    return this.http.put<Hallgato>(`${this.apiUrl}/${id}`, hallgato);
  }

  deleteHallgato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Később ide jöhetnek egyéb hallgató-specifikus service metódusok,
  // pl. hallgató kurzusainak lekérdezése, átlag számítása stb.
  // getHallgatoKurzusai(id: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/${id}/kurzusok`);
  // }
  // getHallgatoAtlag(id: number): Observable<{ atlag: number | null }> {
  //   return this.http.get<{ atlag: number | null }>(`${this.apiUrl}/${id}/atlag`);
  // }
}