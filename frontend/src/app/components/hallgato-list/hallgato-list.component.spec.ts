import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallgatoListComponent } from './hallgato-list.component';

describe('HallgatoListComponent', () => {
  let component: HallgatoListComponent;
  let fixture: ComponentFixture<HallgatoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallgatoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HallgatoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
