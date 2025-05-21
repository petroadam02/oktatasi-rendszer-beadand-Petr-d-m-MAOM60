import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { StatisztikaService, HallgatoAtlagResponse, TankorAtlagResponse } from '../../services/statisztika.service';
import { HallgatoService } from '../../services/hallgato.service';
import { Hallgato } from '../../models/hallgato.model';
import { Observable, map } from 'rxjs'; 

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-statisztika',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,   
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './statisztika.component.html',
  styleUrls: ['./statisztika.component.scss']
})
export class StatisztikaComponent implements OnInit {
  hallgatoAtlagForm: FormGroup;
  tankorAtlagForm: FormGroup;

  hallgatok$: Observable<Hallgato[]>;
  egyediTankorok$: Observable<string[]>;

  hallgatoAtlagEredmeny: HallgatoAtlagResponse | null = null;
  tankorAtlagEredmeny: TankorAtlagResponse | null = null;

  isLoadingHallgatoAtlag = false;
  isLoadingTankorAtlag = false;

  private fb = inject(FormBuilder);
  private statisztikaService = inject(StatisztikaService);
  private hallgatoService = inject(HallgatoService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.hallgatoAtlagForm = this.fb.group({
      hallgatoId: [null, Validators.required]
    });

    this.tankorAtlagForm = this.fb.group({
      tankor: [null, Validators.required]
    });

    this.hallgatok$ = this.hallgatoService.getHallgatok();
    
    // Egyedi tankörök kigyűjtése a hallgatók listájából
    this.egyediTankorok$ = this.hallgatok$.pipe(
      map(hallgatok => {
        const tankorok = hallgatok.map(h => h.tankor);
        return [...new Set(tankorok)].sort(); // Egyedi, rendezett lista
      })
    );
  }

  ngOnInit(): void {}

  onLekerdezHallgatoAtlag(): void {
     if (this.hallgatoAtlagForm.invalid) {
       this.snackBar.open('Kérjük, válasszon ki egy hallgatót!', 'Bezár', { duration: 3000 });
       return;
     }
     const hallgatoId = this.hallgatoAtlagForm.value.hallgatoId;
     this.isLoadingHallgatoAtlag = true;
     this.hallgatoAtlagEredmeny = null;

     this.statisztikaService.getHallgatoAtlag(hallgatoId).subscribe({
       next: (data) => {
         this.hallgatoAtlagEredmeny = data;
         this.isLoadingHallgatoAtlag = false;
       },
       error: (err) => {
         console.error("Hiba a hallgatói átlag lekérdezésekor:", err);
         this.snackBar.open('Hiba a hallgatói átlag lekérdezésekor.', 'Bezár', { duration: 3000 });
         this.isLoadingHallgatoAtlag = false;
       }
     });
  }

  onLekerdezTankorAtlag(): void {
    if (this.tankorAtlagForm.invalid) {
      this.snackBar.open('Kérjük, válasszon ki egy tankört!', 'Bezár', { duration: 3000 });
      return;
    }
    const kivalasztottTankor = this.tankorAtlagForm.value.tankor; 
    this.isLoadingTankorAtlag = true;
    this.tankorAtlagEredmeny = null;

    this.statisztikaService.getTankorAtlag(kivalasztottTankor).subscribe({
      next: (data) => {
        this.tankorAtlagEredmeny = data;
        this.isLoadingTankorAtlag = false;
      },
      error: (err) => {
        console.error("Hiba a tankörátlag lekérdezésekor:", err);
        this.snackBar.open('Hiba a tankörátlag lekérdezésekor.', 'Bezár', { duration: 3000 });
        this.isLoadingTankorAtlag = false;
      }
    });
  }
}