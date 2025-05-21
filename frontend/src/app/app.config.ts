import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptorFn } from './interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(), // Ez lehetővé teszi a DI-t az osztály alapú interceptorokban (ha lennének)
      withInterceptors([authInterceptorFn]) // Funkcionális interceptor hozzáadása
    ) 
  ]
};