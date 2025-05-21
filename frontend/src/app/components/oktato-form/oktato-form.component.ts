import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Reactive Forms modulok
import { OktatoService } from '../../services/oktato.service';
import { Oktato } from '../../models/oktato.model';

// Angular Material modulok az űrlaphoz
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Értesítésekhez

@Component({
  selector: 'app-oktato-form',
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
  templateUrl: './oktato-form.component.html',
  styleUrls: ['./oktato-form.component.scss']
})
export class OktatoFormComponent implements OnInit {
  oktatoForm: FormGroup;
  isEditMode = false;
  oktatoId: number | null = null; // Aktuális oktató ID-ja szerkesztéskor

  private fb = inject(FormBuilder);
  private oktatoService = inject(OktatoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // ActivatedRoute injektálása
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.oktatoForm = this.fb.group({
      nev: ['', [Validators.required, Validators.minLength(3)]],
      tanszek: ['']
    });
  }

  ngOnInit(): void {
    // ID kiolvasása az útvonal paramétereiből
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.oktatoId = +idParam; // A '+' jel számmá konvertálja a stringet
      this.loadOktatoData();
    }
  }

  loadOktatoData(): void {
    if (this.oktatoId === null) return;

    this.oktatoService.getOktatoById(this.oktatoId).subscribe({
      next: (oktato) => {
        // Az űrlap mezőinek feltöltése a kapott oktató adataival
        this.oktatoForm.patchValue({
          nev: oktato.nev,
          tanszek: oktato.tanszek
        });
      },
      error: (err) => {
        console.error('Hiba az oktató adatainak betöltésekor:', err);
        this.snackBar.open('Hiba az oktató adatainak betöltésekor.', 'Bezár', { duration: 3000 });
        this.router.navigate(['/oktatok']); // Hiba esetén visszanavigálunk
      }
    });
  }

  onSubmit(): void {
    if (this.oktatoForm.invalid) {
      this.snackBar.open('Kérjük, töltse ki helyesen az összes kötelező mezőt!', 'Bezár', { duration: 3000 });
      return;
    }

    const formData = this.oktatoForm.value;

    if (this.isEditMode && this.oktatoId !== null) {
      // Szerkesztési logika
      this.oktatoService.updateOktato(this.oktatoId, formData).subscribe({
        next: () => {
          this.snackBar.open('Oktató sikeresen módosítva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/oktatok']);
        },
        error: (err) => {
          console.error('Hiba az oktató módosításakor:', err);
          this.snackBar.open('Hiba történt az oktató módosításakor.', 'Bezár', { duration: 3000 });
        }
      });
    } else {
      // Létrehozási logika (ez már megvolt)
      this.oktatoService.createOktato(formData).subscribe({
        next: () => {
          this.snackBar.open('Oktató sikeresen létrehozva!', 'Bezár', { duration: 3000 });
          this.router.navigate(['/oktatok']);
        },
        error: (err) => {
          console.error('Hiba az oktató létrehozásakor:', err);
          this.snackBar.open('Hiba történt az oktató létrehozásakor.', 'Bezár', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/oktatok']);
  }
}