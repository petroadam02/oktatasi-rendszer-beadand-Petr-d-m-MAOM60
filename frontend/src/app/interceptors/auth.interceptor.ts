import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHandlerFn 
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // AuthService importálása

// Funkcionális interceptor
export const authInterceptorFn: (req: HttpRequest<unknown>, next: HttpHandlerFn) => Observable<HttpEvent<unknown>> = 
  (req, next) => {
    const authService = inject(AuthService); // AuthService injektálása
    const authToken = authService.getToken();
    if (authToken) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next(authReq);
    }

    // Ha nincs token, egyszerűen továbbküldi az eredeti kérést
    return next(req);
};