import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TargyService, CreateTargyDto } from '../../services/targy.service'; // CreateTargyDto importálása
import { Targy } from '../../models/targy.model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-targy-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './targy-form.component.html',
  styleUrls: ['./targy-form.component.scss']
})
export class TargyFormComponent implements OnInit {
  targyForm: FormGroup;
  isEditMode = false;
  targyId: number | null = null;

  private fb = inject(FormBuilder);
  private targyService = inject(TargyService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.targyForm = this.fb.group({
      nev: ['', [Validators.required, Validators.minLength(3)]],
      kod: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]+$')]], // Tárgykód minta (betűk, számok, kötőjel)
      kredit: [null, [Validators.required, Validators.min(0), Validators.max(30), Validators.pattern('^[0-9]+$')]] // Pozitív egész szám
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.targyId = +idParam;
      this.loadTargyData();
    }
  }

  loadTargyData(): void {
    if (this.targyId === null) return;

    this.targyService.getTargyById(this.targyId).subscribe({
      next: (targy) => {
        this.targyForm.patchValue(targy);
      },
      error: (err) => {
        console.error('Hiba a tárgy adatainak betöltésekor:', err);
        this.snackBar.open('Hiba a tárgy adatainak betöltésekor.', 'Bezár', { duration: 3000 });
        this.router.navigate(['/targyak']);
      }
    });
  }

  onSubmit(): void {
    if (this.targyForm.invalid) {
      this.snackBar.open('Kérjük, töltse ki helyesen az összes kötelező mezőt!', 'Bezár', { duration: 3000 });
      return;
    }

    const formData = this.targyForm.value as CreateTargyDto; // CreateTargyDto használata a típusbiztonságért

    if (this.isEditMode && this.targyId !== null) {
      this.targyService.updateTargy(this.targyId, formData).subscribe({
        next: () => {
          this.snackBar.open('Tárgy sikeresen módosítva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/targyak']);
        },
        error: (err) => {
          console.error('Hiba a tárgy módosításakor:', err);
          let errorMessage = 'Hiba történt a tárgy módosításakor.';
          if (err.error && err.error.error && typeof err.error.error === 'string') {
             errorMessage = err.error.error;
          } else if (err.error && err.error.message && typeof err.error.message === 'string') {
            errorMessage = err.error.message;
          }
          this.snackBar.open(errorMessage, 'Bezár', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    } else {
      this.targyService.createTargy(formData).subscribe({
        next: () => {
          this.snackBar.open('Tárgy sikeresen létrehozva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/targyak']);
        },
        error: (err) => {
          console.error('Hiba a tárgy létrehozásakor:', err);
          let errorMessage = 'Hiba történt a tárgy létrehozásakor.';
          if (err.error && err.error.error && typeof err.error.error === 'string') {
             errorMessage = err.error.error;
          } else if (err.error && err.error.message && typeof err.error.message === 'string') {
            errorMessage = err.error.message;
          }
          // A backend 409 Conflict hibát ad, ha a tárgykód már létezik
          // Ezt az err.status alapján is ellenőrizhetnénk
          this.snackBar.open(errorMessage, 'Bezár', { duration: 5000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/targyak']);
  }
}