import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HallgatoService } from '../../services/hallgato.service';
import { Hallgato } from '../../models/hallgato.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-hallgato-list',
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
  templateUrl: './hallgato-list.component.html',
  styleUrls: ['./hallgato-list.component.scss']
})
export class HallgatoListComponent implements OnInit {
  hallgatok: Hallgato[] = [];
  isLoading = true;
  displayedColumns: string[] = ['id', 'nev', 'tritonKod', 'email', 'tankor', 'actions'];

  private hallgatoService = inject(HallgatoService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() { }

  ngOnInit(): void {
    this.loadHallgatok();
  }

  loadHallgatok(): void {
    this.isLoading = true;
    this.hallgatoService.getHallgatok().subscribe({
      next: (data) => {
        this.hallgatok = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Hiba a hallgatók betöltésekor:', err);
        this.isLoading = false;
        this.snackBar.open('Hiba történt a hallgatók betöltése közben.', 'Bezár', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  ujHallgato(): void {
    this.router.navigate(['/hallgatok/uj']);
  }

  editHallgato(hallgato: Hallgato): void {
    this.router.navigate(['/hallgatok/szerkeszt', hallgato.id]);
  }

  deleteHallgato(id: number): void {
    const confirmation = window.confirm('Biztosan törölni szeretné ezt a hallgatót?');

    if (confirmation) {
      this.isLoading = true;
      this.hallgatoService.deleteHallgato(id).subscribe({
        next: () => {
          this.snackBar.open('Hallgató sikeresen törölve!', 'Bezár', { duration: 3000 });
          this.loadHallgatok();
        },
        error: (err: HttpErrorResponse) => { 
          console.error('Hiba a hallgató törlésekor:', err);
          let errorMessage = 'Hiba történt a hallgató törlésekor.';
          if (err.error && err.error.error) {
            errorMessage = err.error.error;
          } else if (err.error && err.error.message) {
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

  navigateToHallgatoKurzusai(hallgatoId: number): void {
  this.router.navigate(['/hallgatok', hallgatoId, 'kurzusai']);
  }
}