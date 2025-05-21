import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OktatoFormComponent } from './oktato-form.component';

describe('OktatoFormComponent', () => {
  let component: OktatoFormComponent;
  let fixture: ComponentFixture<OktatoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OktatoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OktatoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
