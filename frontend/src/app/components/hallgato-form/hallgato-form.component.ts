import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HallgatoService } from '../../services/hallgato.service';
import { Hallgato } from '../../models/hallgato.model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-hallgato-form',
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
  templateUrl: './hallgato-form.component.html',
  styleUrls: ['./hallgato-form.component.scss']
})
export class HallgatoFormComponent implements OnInit {
  hallgatoForm: FormGroup;
  isEditMode = false;
  hallgatoId: number | null = null;

  private fb = inject(FormBuilder);
  private hallgatoService = inject(HallgatoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.hallgatoForm = this.fb.group({
      nev: ['', [Validators.required, Validators.minLength(3)]],
      tritonKod: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(6), 
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      email: ['', [Validators.required, Validators.email]],
      tankor: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.hallgatoId = +idParam;
      this.loadHallgatoData();
    }
  }

  loadHallgatoData(): void {
    if (this.hallgatoId === null) return;

    this.hallgatoService.getHallgatoById(this.hallgatoId).subscribe({
      next: (hallgato) => {
        this.hallgatoForm.patchValue(hallgato); // feltöltjük az űrlapot a hallgató adataival
      },
      error: (err) => {
        console.error('Hiba a hallgató adatainak betöltésekor:', err);
        this.snackBar.open('Hiba a hallgató adatainak betöltésekor.', 'Bezár', { duration: 3000 });
        this.router.navigate(['/hallgatok']);
      }
    });
  }

  onSubmit(): void {
    if (this.hallgatoForm.invalid) {
      this.snackBar.open('Kérjük, töltse ki helyesen az összes kötelező mezőt!', 'Bezár', { duration: 3000 });
      return;
    }

    const formData = this.hallgatoForm.value;

    if (this.isEditMode && this.hallgatoId !== null) {
      // Szerkesztési logika
      this.hallgatoService.updateHallgato(this.hallgatoId, formData).subscribe({
        next: () => {
          this.snackBar.open('Hallgató sikeresen módosítva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/hallgatok']);
        },
        error: (err) => {
          console.error('Hiba a hallgató módosításakor:', err);
          this.snackBar.open('Hiba történt a hallgató módosításakor.', 'Bezár', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      });
    } else {
      // Létrehozási logika
      this.hallgatoService.createHallgato(formData).subscribe({
        next: () => {
          this.snackBar.open('Hallgató sikeresen létrehozva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/hallgatok']);
        },
        error: (err) => {
          console.error('Hiba a hallgató létrehozásakor:', err);
          this.snackBar.open('Hiba történt a hallgató létrehozásakor.', 'Bezár', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/hallgatok']);
  }
}