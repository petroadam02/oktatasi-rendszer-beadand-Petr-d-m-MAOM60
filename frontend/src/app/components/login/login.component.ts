import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, LoginCredentials } from '../../services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Kérjük, adja meg az email címét és jelszavát!', 'Bezár', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const credentials: LoginCredentials = {
        email: this.loginForm.value.email,
        password_hash: this.loginForm.value.password // A backend service DTO 'password_hash'-t vár
    };
    console.log('Bejelentkezési adatok küldés előtt:', credentials);
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Sikeres bejelentkezés!', 'Bezár', { duration: 3000 });
        // Sikeres bejelentkezés után navigáljunk pl. az oktatók listájára
        this.router.navigate(['/oktatok']); 
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Bejelentkezési hiba:', err);
        let errorMessage = 'Hiba a bejelentkezés során.';
        if (err.status === 401) {
          errorMessage = 'Hibás email cím vagy jelszó.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, 'Bezár', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}