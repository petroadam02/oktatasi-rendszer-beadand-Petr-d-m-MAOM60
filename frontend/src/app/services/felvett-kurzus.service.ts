import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FelvettKurzus } from '../models/felvettkurzus.model';

// DTO-t a hallgató kurzusra való felvételéhez
export interface HallgatoFelvetelApiDto {
  hallgatoId: number;
}

// DTO az érdemjegy frissítéséhez (backend API várhatja ezt a struktúrát)
export interface ErdemjegyUpdateDto {
  erdemjegy: number;
}

@Injectable({
  providedIn: 'root'
})
export class FelvettKurzusService {
  private apiUrl = 'http://localhost:3001/api';
  private http = inject(HttpClient);

  constructor() { }

  hallgatoFelveteleKurzusra(kurzusId: number, hallgatoId: number): Observable<FelvettKurzus> {
    const payload: HallgatoFelvetelApiDto = { hallgatoId: hallgatoId };
    return this.http.post<FelvettKurzus>(`${this.apiUrl}/kurzusok/${kurzusId}/hallgatok`, payload);
  }

  //Hallgató összes felvett kurzusának lekérdezése érdemjegyekkel
  getHallgatoKurzusai(hallgatoId: number): Observable<FelvettKurzus[]> {
    return this.http.get<FelvettKurzus[]>(`${this.apiUrl}/hallgatok/${hallgatoId}/kurzusok`);

  }

  //Érdemjegy beírása/módosítása egy adott kurzusfelvételhez
  erdemjegyBeirasa(felvettKurzusId: number, data: ErdemjegyUpdateDto): Observable<FelvettKurzus> {
    return this.http.put<FelvettKurzus>(`${this.apiUrl}/felvettkurzusok/${felvettKurzusId}`, data);
  }

  getFelvettKurzusById(id: number): Observable<FelvettKurzus> {
    return this.http.get<FelvettKurzus>(`${this.apiUrl}/felvettkurzusok/${id}`);
  }

  getKurzusFelvettHallgatok(kurzusId: number): Observable<FelvettKurzus[]> {
  return this.http.get<FelvettKurzus[]>(`${this.apiUrl}/kurzusok/${kurzusId}/felvett-hallgatok`);
  }
} 