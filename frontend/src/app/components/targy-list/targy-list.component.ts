import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TargyService } from '../../services/targy.service';
import { Targy } from '../../models/targy.model';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-targy-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './targy-list.component.html',
  styleUrls: ['./targy-list.component.scss']
})
export class TargyListComponent implements OnInit {
  targyak: Targy[] = [];
  isLoading = true;
  displayedColumns: string[] = ['id', 'nev', 'kod', 'kredit', 'actions']; // Megjelenítendő oszlopok

  private targyService = inject(TargyService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() { }

  ngOnInit(): void {
    this.loadTargyak();
  }

  loadTargyak(): void {
    this.isLoading = true;
    this.targyService.getTargyak().subscribe({
      next: (data) => {
        this.targyak = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Hiba a tárgyak betöltésekor:', err);
        this.isLoading = false;
        this.snackBar.open('Hiba történt a tárgyak betöltése közben.', 'Bezár', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

   ujTargy(): void {
    this.router.navigate(['/targyak/uj']);
  }

  editTargy(targy: Targy): void {
    this.router.navigate(['/targyak/szerkeszt', targy.id]);
  }

  deleteTargy(id: number): void {
    const confirmation = window.confirm('Biztosan törölni szeretné ezt a tárgyat?');

    if (confirmation) {
      this.isLoading = true;
      this.targyService.deleteTargy(id).subscribe({
        next: () => {
          this.snackBar.open('Tárgy sikeresen törölve!', 'Bezár', { duration: 3000 });
          this.loadTargyak(); // Frissítjük a listát
        },
        error: (err: HttpErrorResponse) => {
          console.error('Hiba a tárgy törlésekor:', err);
          let errorMessage = 'Hiba történt a tárgy törlésekor.';
          if (err.error && err.error.error && typeof err.error.error === 'string') { 
            errorMessage = err.error.error;
          } else if (err.error && err.error.message && typeof err.error.message === 'string') {
            errorMessage = err.error.message;
          }
          this.snackBar.open(errorMessage, 'Bezár', { 
            duration: 5000, 
            panelClass: ['error-snackbar'] 
          });
          this.isLoading = false;
        }
      });
    }
  }
}