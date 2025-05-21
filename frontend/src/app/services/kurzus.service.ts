import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Kurzus, CreateKurzusDto, UpdateKurzusDto } from '../models/kurzus.model'; 

@Injectable({
  providedIn: 'root'
})
export class KurzusService {
  private apiUrl = 'http://localhost:3001/api/kurzusok';

  constructor(private http: HttpClient) { }

  getKurzusok(): Observable<Kurzus[]> {
    return this.http.get<Kurzus[]>(this.apiUrl);
  }

  getKurzusById(id: number): Observable<Kurzus> {
    return this.http.get<Kurzus>(`${this.apiUrl}/${id}`);
  }

  // A kurzusData típusa a ../models/kurzus.model-ből importált CreateKurzusDto
  createKurzus(kurzusData: CreateKurzusDto): Observable<Kurzus> { 
    return this.http.post<Kurzus>(this.apiUrl, kurzusData);
  }

  // A kurzusData típusa a ../models/kurzus.model-ből importált UpdateKurzusDto
  updateKurzus(id: number, kurzusData: UpdateKurzusDto): Observable<Kurzus> { 
    return this.http.put<Kurzus>(`${this.apiUrl}/${id}`, kurzusData);
  }

  deleteKurzus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
