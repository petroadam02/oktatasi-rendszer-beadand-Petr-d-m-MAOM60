import { Oktato } from "./oktato.model";
import { Targy } from "./targy.model";

export interface Kurzus {
  id: number;
  kurzusKod: string;
  kurzusNev?: string;
  maxLetszam: number;
  targy: Targy;    
  oktato: Oktato;  
}

// DTO (Data Transfer Object) új kurzus létrehozásához
export interface CreateKurzusDto {
  kurzusKod: string;
  kurzusNev?: string;
  maxLetszam: number;
  targyId: number;
  oktatoId: number; 
}

// DTO kurzus frissítéséhez (minden mező opcionális)
export type UpdateKurzusDto = Partial<CreateKurzusDto>;