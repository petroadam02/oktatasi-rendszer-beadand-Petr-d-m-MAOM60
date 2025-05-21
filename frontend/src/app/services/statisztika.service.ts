import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HallgatoAtlagResponse {
  atlag: number | null;
  figyelembeVettErdemjegyekSzama: number;
}

export interface TankorAtlagResponse {
  tankor: string;
  atlag: number | null;
  figyelembeVettErdemjegyekSzama: number;
  hallgatokSzamaEbbenATankorben: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisztikaService {
  private apiUrl = 'http://localhost:3001/api';
  private http = inject(HttpClient);

  constructor() { }

  getHallgatoAtlag(hallgatoId: number): Observable<HallgatoAtlagResponse> {
    return this.http.get<HallgatoAtlagResponse>(`${this.apiUrl}/hallgatok/${hallgatoId}/atlag`);
  }

  getTankorAtlag(tankorAzonosito: string): Observable<TankorAtlagResponse> {
    const params = new HttpParams().set('tankor', tankorAzonosito);
    return this.http.get<TankorAtlagResponse>(`${this.apiUrl}/statisztikak/tankor-atlag`, { params }); 
  }
}