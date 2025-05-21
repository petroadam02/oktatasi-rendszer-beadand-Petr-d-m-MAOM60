import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { KurzusService } from '../../services/kurzus.service';
import { CreateKurzusDto } from '../../models/kurzus.model';
import { OktatoService } from '../../services/oktato.service';
import { TargyService } from '../../services/targy.service';
import { Oktato } from '../../models/oktato.model';
import { Targy } from '../../models/targy.model';
import { Observable } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select'; // Select modul importálása

@Component({
  selector: 'app-kurzus-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule // MatSelectModule hozzáadása
  ],
  templateUrl: './kurzus-form.component.html',
  styleUrls: ['./kurzus-form.component.scss']
})
export class KurzusFormComponent implements OnInit {
  kurzusForm: FormGroup;
  isEditMode = false;
  kurzusId: number | null = null;

  oktatok$: Observable<Oktato[]>; // Oktatók listája az űrlaphoz
  targyak$: Observable<Targy[]>;   // Tárgyak listája az űrlaphoz

  private fb = inject(FormBuilder);
  private kurzusService = inject(KurzusService);
  private oktatoService = inject(OktatoService);
  private targyService = inject(TargyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.kurzusForm = this.fb.group({
      kurzusKod: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-_]+$')]],
      kurzusNev: [''], // Opcionális
      maxLetszam: [null, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
      targyId: [null, Validators.required],
      oktatoId: [null, Validators.required]
    });

    this.oktatok$ = this.oktatoService.getOktatok();
    this.targyak$ = this.targyService.getTargyak();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.kurzusId = +idParam;
      this.loadKurzusData();
    }
  }

  loadKurzusData(): void {
    if (this.kurzusId === null) return;

    this.kurzusService.getKurzusById(this.kurzusId).subscribe({
      next: (kurzus) => {
        this.kurzusForm.patchValue({
          kurzusKod: kurzus.kurzusKod,
          kurzusNev: kurzus.kurzusNev,
          maxLetszam: kurzus.maxLetszam,
          targyId: kurzus.targy.id,     // A kapcsolódó tárgy ID-ja
          oktatoId: kurzus.oktato.id    // A kapcsolódó oktató ID-ja
        });
      },
      error: (err) => {
        console.error('Hiba a kurzus adatainak betöltésekor:', err);
        this.snackBar.open('Hiba a kurzus adatainak betöltésekor.', 'Bezár', { duration: 3000 });
        this.router.navigate(['/kurzusok']);
      }
    });
  }

  onSubmit(): void {
    if (this.kurzusForm.invalid) {
      this.snackBar.open('Kérjük, töltse ki helyesen az összes kötelező mezőt!', 'Bezár', { duration: 3000 });
      return;
    }

    const formData = this.kurzusForm.value as CreateKurzusDto;

    if (this.isEditMode && this.kurzusId !== null) {
      this.kurzusService.updateKurzus(this.kurzusId, formData).subscribe({
        next: () => {
          this.snackBar.open('Kurzus sikeresen módosítva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/kurzusok']);
        },
        error: (err) => {
          console.error('Hiba a kurzus módosításakor:', err);
          this.snackBar.open('Hiba történt a kurzus módosításakor.', 'Bezár', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      });
    } else {
      this.kurzusService.createKurzus(formData).subscribe({
        next: () => {
          this.snackBar.open('Kurzus sikeresen létrehozva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/kurzusok']);
        },
        error: (err) => {
          console.error('Hiba a kurzus létrehozásakor:', err);
          let errorMessage = 'Hiba történt a kurzus létrehozásakor.';
           if (err.error && err.error.error && typeof err.error.error === 'string') {
             errorMessage = err.error.error;
          } else if (err.error && err.error.message && typeof err.error.message === 'string') {
            errorMessage = err.error.message;
          }
          this.snackBar.open(errorMessage, 'Bezár', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/kurzusok']);
  }
}