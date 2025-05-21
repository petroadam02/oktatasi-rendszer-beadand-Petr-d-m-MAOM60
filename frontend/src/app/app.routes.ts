import { Routes } from '@angular/router';
import { OktatoListComponent } from './components/oktato-list/oktato-list.component';
import { OktatoFormComponent } from './components/oktato-form/oktato-form.component';
import { HallgatoListComponent } from './components/hallgato-list/hallgato-list.component';
import { HallgatoFormComponent } from './components/hallgato-form/hallgato-form.component';
import { TargyListComponent } from './components/targy-list/targy-list.component';
import { TargyFormComponent } from './components/targy-form/targy-form.component';
import { KurzusListComponent } from './components/kurzus-list/kurzus-list.component';
import { KurzusFormComponent } from './components/kurzus-form/kurzus-form.component';
import { HallgatoKurzusaiComponent } from './components/hallgato-kurzusai/hallgato-kurzusai.component';
import { LoginComponent } from './components/login/login.component';
import { OktatoTargyaiComponent } from './components/oktato-targyai/oktato-targyai.component';
import { authGuard } from './guards/auth.guard';
import { StatisztikaComponent } from './components/statisztika/statisztika.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Bejelentkezés' },

  //OKTATOK
  { 
    path: 'oktatok', 
    component: OktatoListComponent, 
    title: 'Oktatók Listája',
    canActivate: [authGuard]
  },
  { 
    path: 'oktatok/uj', 
    component: OktatoFormComponent, 
    title: 'Új Oktató Felvétele',
    canActivate: [authGuard]
  },
  { 
    path: 'oktatok/szerkeszt/:id', 
    component: OktatoFormComponent, 
    title: 'Oktató Szerkesztése',
    canActivate: [authGuard] 
  },
  { 
    path: 'oktatok/:oktatoId/targyai',
    component: OktatoTargyaiComponent, 
    title: 'Oktató Tárgyai',
    canActivate: [authGuard]
  },

  //HALLGATOK
  { 
    path: 'hallgatok', 
    component: HallgatoListComponent, 
    title: 'Hallgatók Listája',
    canActivate: [authGuard] 
  },
  { 
    path: 'hallgatok/uj', 
    component: HallgatoFormComponent, 
    title: 'Új Hallgató Felvétele',
    canActivate: [authGuard] 
  },
  { 
    path: 'hallgatok/szerkeszt/:id', 
    component: HallgatoFormComponent, 
    title: 'Hallgató Szerkesztése',
    canActivate: [authGuard] 
  },
  { 
    path: 'hallgatok/:hallgatoId/kurzusai', 
    component: HallgatoKurzusaiComponent, 
    title: 'Hallgató Felvett Kurzusai',
    canActivate: [authGuard]
  },

  //TARGYAK
  { 
    path: 'targyak', 
    component: TargyListComponent, 
    title: 'Tárgyak Listája',
    canActivate: [authGuard] 
  },
  { 
    path: 'targyak/uj', 
    component: TargyFormComponent, 
    title: 'Új Tárgy Felvétele',
    canActivate: [authGuard] 
  },
  { 
    path: 'targyak/szerkeszt/:id', 
    component: TargyFormComponent, 
    title: 'Tárgy Szerkesztése',
    canActivate: [authGuard] 
  },

  //KURZUSOK
  { 
    path: 'kurzusok', 
    component: KurzusListComponent, 
    title: 'Kurzusok Listája',
    canActivate: [authGuard]
  },
  { 
    path: 'kurzusok/uj', 
    component: KurzusFormComponent, 
    title: 'Új Kurzus Felvétele',
    canActivate: [authGuard] 
  },
  { 
    path: 'kurzusok/szerkeszt/:id', 
    component: KurzusFormComponent, 
    title: 'Kurzus Szerkesztése',
    canActivate: [authGuard]
  },

  //STATISZTIKA
  { 
    path: 'statisztikak',
    component: StatisztikaComponent, 
    title: 'Statisztikák',
    canActivate: [authGuard]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Átirányítás a loginra, ha a gyökér van megadva
  { path: '**', redirectTo: '/login' } // Minden más ismeretlen útvonal is a loginra (vagy egy 404 oldalra)
];