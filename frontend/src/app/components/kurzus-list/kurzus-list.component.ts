import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KurzusService } from '../../services/kurzus.service';
import { Kurzus } from '../../models/kurzus.model';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EnrollStudentDialogComponent } from '../dialogs/enroll-student-dialog/enroll-student-dialog.component';

@Component({
  selector: 'app-kurzus-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './kurzus-list.component.html',
  styleUrls: ['./kurzus-list.component.scss']
})
export class KurzusListComponent implements OnInit {
  kurzusok: Kurzus[] = [];
  isLoading = true;
  // A `targy` és `oktato` oszlopok a kapcsolódó objektumok 'nev' property-jét jelenítik majd meg
  displayedColumns: string[] = ['id', 'kurzusKod', 'kurzusNev', 'targy', 'oktato', 'maxLetszam', 'actions'];

  private kurzusService = inject(KurzusService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  constructor() { }

  ngOnInit(): void {
    this.loadKurzusok();
  }

  loadKurzusok(): void {
    this.isLoading = true;
    this.kurzusService.getKurzusok().subscribe({
      next: (data) => {
        this.kurzusok = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Hiba a kurzusok betöltésekor:', err);
        this.isLoading = false;
        this.snackBar.open('Hiba történt a kurzusok betöltése közben.', 'Bezár', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  ujKurzus(): void {
    this.router.navigate(['/kurzusok/uj']);
  }

  editKurzus(kurzus: Kurzus): void {
    this.router.navigate(['/kurzusok/szerkeszt', kurzus.id]);
  }

   deleteKurzus(id: number): void {
    const confirmation = window.confirm('Biztosan törölni szeretné ezt a kurzust? Ehhez kapcsolódó hallgatói felvételek is befolyásolhatják a törlést.');

    if (confirmation) {
      this.isLoading = true;
      this.kurzusService.deleteKurzus(id).subscribe({
        next: () => {
          this.snackBar.open('Kurzus sikeresen törölve!', 'Bezár', { duration: 3000 });
          this.loadKurzusok(); // Frissítjük a listát
        },
        error: (err: HttpErrorResponse) => {
          console.error('Hiba a kurzus törlésekor:', err);
          let errorMessage = 'Hiba történt a kurzus törlésekor.';
          // Itt megpróbálom kiolvasni a backend által küldött konkrét hibaüzenetet
          if (err.error && err.error.error && typeof err.error.error === 'string') { 
            errorMessage = err.error.error;
          } else if (err.error && err.error.message && typeof err.error.message === 'string') {
            errorMessage = err.error.message;
          } else if (typeof err.error === 'string') { // Néha a hibaüzenet közvetlenül az err.error-ban van
            errorMessage = err.error;
          }
          
          this.snackBar.open(errorMessage, 'Bezár', { 
            duration: 7000, // Hosszabb idő a potenciálisan hosszabb hibaüzenet olvasásához
            panelClass: ['error-snackbar'] 
          });
          this.isLoading = false; 
        }
      });
    }
  }
  openEnrollStudentDialog(kurzus: Kurzus): void {
    const dialogRef = this.dialog.open(EnrollStudentDialogComponent, {
      width: '500px',
      data: { kurzusId: kurzus.id, kurzusNev: kurzus.kurzusNev }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('A dialógusablak bezárult, eredmény:', result);
      if (result === 'enrolled') {
        this.loadKurzusok();
        this.snackBar.open('Hallgató(k) sikeresen felvéve a kurzusra!', 'Bezár', { duration: 3000 });
      }
    });
  }

  // Segédfüggvény a tárgy nevének megjelenítéséhez a táblázatban
  getTargyNev(kurzus: Kurzus): string {
    return kurzus.targy ? kurzus.targy.nev : '-';
  }

  // Segédfüggvény az oktató nevének megjelenítéséhez a táblázatban
  getOktatoNev(kurzus: Kurzus): string {
    return kurzus.oktato ? kurzus.oktato.nev : '-';
  }
}