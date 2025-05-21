import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HallgatoFormComponent } from './hallgato-form.component';

describe('HallgatoFormComponent', () => {
  let component: HallgatoFormComponent;
  let fixture: ComponentFixture<HallgatoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HallgatoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HallgatoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
