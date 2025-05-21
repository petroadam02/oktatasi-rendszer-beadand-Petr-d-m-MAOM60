import { Component, Inject, OnInit, inject } from '@angular/core'; // OnInit importálása
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HallgatoService } from '../../../services/hallgato.service'; // HallgatoService import
import { Hallgato } from '../../../models/hallgato.model';       // Hallgato modell import
import { FelvettKurzusService } from '../../../services/felvett-kurzus.service'; // FelvettKurzusService import
import { MatListModule, MatListOption, MatSelectionList } from '@angular/material/list'; // Material List modulok
import { FormsModule } from '@angular/forms'; // FormsModule a ngModel-hez (ha template-driven lenne, de selection-list-hez jó)
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';
 import { forkJoin, map, Observable } from 'rxjs';



export interface EnrollDialogData {
  kurzusId: number;
  kurzusNev: string;
}

@Component({
  selector: 'app-enroll-student-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule,
    MatListModule,
    FormsModule,
    MatSnackBarModule
  ],
  templateUrl: './enroll-student-dialog.component.html',
  styleUrls: ['./enroll-student-dialog.component.scss']
})
export class EnrollStudentDialogComponent implements OnInit { // OnInit implementálása
  
  allHallgatok: Hallgato[] = [];
  selectedHallgatok: Hallgato[] = [];
  isLoading = true;

  private hallgatoService = inject(HallgatoService);
  private felvettKurzusService = inject(FelvettKurzusService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<EnrollStudentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EnrollDialogData
  ) {}

  ngOnInit(): void {
    this.loadHallgatok();
  }

  loadHallgatok(): void {
     this.isLoading = true;
     forkJoin({
       osszesHallgato: this.hallgatoService.getHallgatok(),
       //FelvettKurzus bejegyzések (amik ehhez a kurzushoz tartoznak) lekérdezése
       felvettKurzusBejegyzesek: this.felvettKurzusService.getKurzusFelvettHallgatok(this.data.kurzusId) 
     }).pipe(
       map(results => {
         //A már felvett hallgatók ID-jeinek kinyerése
         const felvettHallgatokIds = new Set(
           results.felvettKurzusBejegyzesek.map(fk => fk.hallgato.id) // Feltételezzük, hogy a FelvettKurzus tartalmazza a hallgato objektumot ID-val
         );
         // Azon hallgatók kiszűrése, akik még nem vették fel
         return results.osszesHallgato.filter(hallgato => !felvettHallgatokIds.has(hallgato.id));
       })
     ).subscribe({
       next: (felvehetoHallgatok) => {
         this.allHallgatok = felvehetoHallgatok;
         this.isLoading = false;
         if (felvehetoHallgatok.length === 0 && !this.isLoading) {
             this.snackBar.open('Nincs több felvehető hallgató erre a kurzusra, vagy hiba történt a betöltéskor.', 'Bezár', {duration: 4000});
         }
       },
       error: (err) => {
         console.error("Hiba a hallgatók betöltésekor a dialógusban:", err);
         this.isLoading = false;
         this.snackBar.open('Hiba a hallgatók betöltésekor.', 'Bezár', { duration: 3000 });
       }
     });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSelectionChange(options: MatListOption[]): void {
    this.selectedHallgatok = options.map(o => o.value);
  }

  async enroll(): Promise<void> {
    if (this.selectedHallgatok.length === 0) {
      this.snackBar.open('Nincs kiválasztott hallgató a felvételhez.', 'Bezár', { duration: 3000 });
      return;
    }

    let sikeresFelvetelek = 0;
    let sikertelenFelvetelek = 0;
    let hibaUzenetek: string[] = [];

    for (const hallgato of this.selectedHallgatok) {
      try {
        await lastValueFrom(this.felvettKurzusService.hallgatoFelveteleKurzusra(
          this.data.kurzusId,
          hallgato.id
        ));
        sikeresFelvetelek++;
      } catch (error: any) {
        sikertelenFelvetelek++;
        const detail = error.error?.error || error.error?.message || error.message || 'Ismeretlen hiba';
        hibaUzenetek.push(`Hiba ${hallgato.nev} felvételekor: ${detail}`);
        console.error(`Hiba ${hallgato.nev} felvételekor a ${this.data.kurzusNev} kurzusra:`, error);
      }
    }

    let finalMessage = '';
    if (sikeresFelvetelek > 0) {
      finalMessage += `${sikeresFelvetelek} hallgató sikeresen felvéve. `;
    }
    if (sikertelenFelvetelek > 0) {
      finalMessage += `${sikertelenFelvetelek} hallgató felvétele sikertelen.`;
      // Részletes hibaüzenetek megjelenítése (opcionális, lehet csak a konzolra)
      console.warn("Sikertelen felvételek részletei:", hibaUzenetek.join('\n'));
      // Vagy a snackbarba egy általánosabb:
      // this.snackBar.open(finalMessage + " Részletek a konzolon.", 'Bezár', { duration: 7000 });
    }
    
    this.snackBar.open(finalMessage || "Nincs végrehajtott művelet.", 'Bezár', { duration: 5000 });

    if (sikeresFelvetelek > 0) {
      this.dialogRef.close('enrolled'); // Jelezzük a hívó komponensnek, hogy történt sikeres felvétel
    } else if (sikertelenFelvetelek > 0 && sikeresFelvetelek === 0) {
      //this.dialogRef.close(); // Nem zárjuk be, vagy más eredményt adunk vissza
    } else {
      this.dialogRef.close();
    }
  }
}