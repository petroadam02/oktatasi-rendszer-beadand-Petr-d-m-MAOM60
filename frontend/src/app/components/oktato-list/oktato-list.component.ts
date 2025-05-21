import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OktatoService } from '../../services/oktato.service';
import { Oktato } from '../../models/oktato.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-oktato-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './oktato-list.component.html',
  styleUrls: ['./oktato-list.component.scss']
})
export class OktatoListComponent implements OnInit {
  oktatok: Oktato[] = [];
  isLoading = true;
  displayedColumns: string[] = ['id', 'nev', 'tanszek', 'actions'];

  private oktatoService = inject(OktatoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() { }

  ngOnInit(): void {
    this.loadOktatok();
  }

  loadOktatok(): void {
    this.isLoading = true;
    this.oktatoService.getOktatok().subscribe({
      next: (data) => {
        this.oktatok = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Hiba az oktatók betöltésekor:', err);
        this.isLoading = false;
        // TODO: Felhasználói hibaüzenet megjelenítése
      }
    });
  }

  editOktato(oktato: Oktato): void {
  this.router.navigate(['/oktatok/szerkeszt', oktato.id]);
  }

  deleteOktato(id: number): void {
    const confirmation = window.confirm('Biztosan törölni szeretné ezt az oktatót?');

    if (confirmation) {
      this.isLoading = true;
      this.oktatoService.deleteOktato(id).subscribe({
        next: () => {
          this.snackBar.open('Oktató sikeresen törölve!', 'Bezár', { duration: 3000 });
          this.loadOktatok(); 
        },
        error: (err: HttpErrorResponse) => { // Típus explicit megadása az err-nek
          console.error('Hiba az oktató törlésekor:', err);
          let errorMessage = 'Hiba történt az oktató törlésekor.'; // Alapértelmezett hibaüzenet
          if (err.error && err.error.error) { // Ellenőrizzük, hogy a backend küldött-e specifikus hibaüzenetet
            errorMessage = err.error.error; // Használjuk a backend által adott részletesebb hibaüzenetet
          } else if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
          // Vagy akár a státuszkód alapján is dönthetnénk:
          // if (err.status === 409) {
          //   errorMessage = err.error.error || 'Az oktató nem törölhető, mert függőségei vannak.';
          // }

          this.snackBar.open(errorMessage, 'Bezár', { 
            duration: 5000, // Hosszabb idő a hibaüzenet olvasásához
            panelClass: ['error-snackbar'] 
          });
          this.isLoading = false;
        }
      });
    }
  }

  ujOktato(): void {
  this.router.navigate(['/oktatok/uj']);
}

}