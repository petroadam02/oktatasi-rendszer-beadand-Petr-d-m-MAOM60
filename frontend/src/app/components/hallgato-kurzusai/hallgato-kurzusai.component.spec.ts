import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallgatoKurzusaiComponent } from './hallgato-kurzusai.component';

describe('HallgatoKurzusaiComponent', () => {
  let component: HallgatoKurzusaiComponent;
  let fixture: ComponentFixture<HallgatoKurzusaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallgatoKurzusaiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HallgatoKurzusaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
