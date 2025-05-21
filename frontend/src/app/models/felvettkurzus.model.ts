// frontend/src/app/models/felvettkurzus.model.ts
import { Hallgato } from './hallgato.model';
import { Kurzus } from './kurzus.model';

export interface FelvettKurzus {
  id: number;
  hallgato: Hallgato; // Vagy csak hallgatoId: number, attól függően, mit ad vissza a backend
  kurzus: Kurzus;   // Vagy csak kurzusId: number
  erdemjegy?: number | null;
}