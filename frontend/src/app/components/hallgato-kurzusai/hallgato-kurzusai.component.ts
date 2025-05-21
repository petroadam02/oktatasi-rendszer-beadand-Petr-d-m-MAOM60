import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FelvettKurzusService } from '../../services/felvett-kurzus.service';
import { FelvettKurzus } from '../../models/felvettkurzus.model'; // Ezt a modellt létre kell hozni a frontend oldalon!
import { HallgatoService } from '../../services/hallgato.service';
import { Hallgato } from '../../models/hallgato.model';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // [(ngModel)]-hez
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
selector: 'app-hallgato-kurzusai',
standalone: true,
imports: [
CommonModule,
MatCardModule,
MatListModule,
MatFormFieldModule,
MatInputModule,
MatButtonModule,
MatIconModule,
FormsModule,
MatSnackBarModule,
MatProgressSpinnerModule
],
templateUrl: './hallgato-kurzusai.component.html',
styleUrls: ['./hallgato-kurzusai.component.scss']
})
export class HallgatoKurzusaiComponent implements OnInit {
hallgatoId!: number;
hallgato: Hallgato | null = null;
felvettKurzusok: FelvettKurzus[] = [];
isLoading = true;
// Ideiglenes érdemjegy tároló az inline szerkesztéshez
erdemjegyInput: { [felvettKurzusId: number]: number | null } = {};

private route = inject(ActivatedRoute);
private router = inject(Router);
private felvettKurzusService = inject(FelvettKurzusService);
private hallgatoService = inject(HallgatoService);
private snackBar = inject(MatSnackBar);

constructor() {}

ngOnInit(): void {
const idParam = this.route.snapshot.paramMap.get('hallgatoId');
if (idParam) {
this.hallgatoId = +idParam;
this.loadHallgatoAdatai();
this.loadFelvettKurzusok();
} else {
console.error('Hallgató ID hiányzik az útvonalból!');
this.isLoading = false;
// Hiba kezelése, pl. visszanavigálás
this.router.navigate(['/hallgatok']);
}
}

loadHallgatoAdatai(): void {
  this.hallgatoService.getHallgatoById(this.hallgatoId).subscribe(
    (data: Hallgato) => this.hallgato = data, // Explicit típus a datának
    (err: HttpErrorResponse) => console.error('Hiba a hallgató adatainak betöltésekor:', err) // Explicit típus az err-nek
  );
}

loadFelvettKurzusok(): void {
  this.isLoading = true;
  this.felvettKurzusService.getHallgatoKurzusai(this.hallgatoId).subscribe({
    next: (data: FelvettKurzus[]) => { // Explicit típus
      this.felvettKurzusok = data;
      data.forEach((fk: FelvettKurzus) => { // Explicit típus
        this.erdemjegyInput[fk.id] = fk.erdemjegy ?? null;
      });
      this.isLoading = false;
    },
    error: (err: HttpErrorResponse) => { // Explicit típus
      console.error('Hiba a hallgató kurzusainak betöltésekor:', err);
      this.isLoading = false;
      this.snackBar.open('Hiba a kurzusok betöltésekor.', 'Bezár', { duration: 3000 });
    }
  });
}

saveErdemjegy(felvettKurzusId: number): void {
const ujErdemjegy = this.erdemjegyInput[felvettKurzusId];

if (ujErdemjegy === null || ujErdemjegy === undefined || ujErdemjegy < 1 || ujErdemjegy > 5 || !Number.isInteger(ujErdemjegy)) {
  this.snackBar.open('Érvénytelen érdemjegy! (1-5 közötti egész szám lehet).', 'Bezár', { duration: 3000 });
  // Visszaállítjuk az eredeti érdemjegyet az input mezőben, ha volt
  const originalFelvettKurzus = this.felvettKurzusok.find(fk => fk.id === felvettKurzusId);
  this.erdemjegyInput[felvettKurzusId] = originalFelvettKurzus?.erdemjegy ?? null;
  return;
}

this.felvettKurzusService.erdemjegyBeirasa(felvettKurzusId, { erdemjegy: ujErdemjegy }).subscribe({
  next: (updatedFelvettKurzus: FelvettKurzus) => { 
    this.snackBar.open('Érdemjegy sikeresen mentve!', 'Bezár', { duration: 3000 });
    this.loadFelvettKurzusok();
  },
  error: (err: HttpErrorResponse) => { // Explicit típus
    console.error('Hiba az érdemjegy mentésekor:', err);
    // A snackbar hibaüzenet kezelése itt már rendben lehet, ha az err.error struktúrát használod
    let errorMessage = 'Hiba történt az érdemjegy mentésekor.';
    if (err.error && typeof err.error === 'object' && err.error !== null) {
        errorMessage = (err.error as any).error || (err.error as any).message || errorMessage;
    } else if (typeof err.error === 'string') {
        errorMessage = err.error;
    }
    this.snackBar.open(errorMessage, 'Bezár', { duration: 3000 });
  }
});
}
}