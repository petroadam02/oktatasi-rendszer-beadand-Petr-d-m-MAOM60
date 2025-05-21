import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; // RouterLink importálása
import { OktatoService } from '../../services/oktato.service';
import { Targy } from '../../models/targy.model'; // Targy modell/interfész
import { Oktato } from '../../models/oktato.model'; // Oktato modell/interfész
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-oktato-targyai',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatListModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './oktato-targyai.component.html',
  styleUrls: ['./oktato-targyai.component.scss']
})
export class OktatoTargyaiComponent implements OnInit, OnDestroy {
  oktatoId: number | null = null;
  oktato: Oktato | null = null;
  targyak: Targy[] = [];
  isLoading = true;
  isLoadingOktato = true;
  private routeSubscription: Subscription | undefined;
  private oktatoSubscription: Subscription | undefined;
  private targyakSubscription: Subscription | undefined;

  private route = inject(ActivatedRoute);
  private oktatoService = inject(OktatoService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('oktatoId');
        if (id) {
          this.oktatoId = +id;
          this.isLoadingOktato = true;
          this.isLoading = true;
          // Oktató adatainak lekérése
          this.oktatoSubscription = this.oktatoService.getOktatoById(this.oktatoId).subscribe({
            next: (oktatoData) => {
              this.oktato = oktatoData;
              this.isLoadingOktato = false;
            },
            error: (err) => {
              console.error('Hiba az oktató adatainak lekérésekor:', err);
              this.snackBar.open('Hiba az oktató adatainak lekérésekor.', 'Bezár', { duration: 3000 });
              this.isLoadingOktato = false;
            }
          });
          // Oktató tárgyainak lekérése
          this.targyakSubscription = this.oktatoService.getOktatoTargyai(this.oktatoId).subscribe({
            next: (data) => {
              this.targyak = data;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Hiba az oktató tárgyainak lekérésekor:', err);
              this.snackBar.open('Hiba az oktató tárgyainak lekérésekor.', 'Bezár', { duration: 3000 });
              this.isLoading = false;
            }
          });
        }
        return []; // switchMap-nek valamit vissza kell adnia
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.oktatoSubscription?.unsubscribe();
    this.targyakSubscription?.unsubscribe();
  }
}