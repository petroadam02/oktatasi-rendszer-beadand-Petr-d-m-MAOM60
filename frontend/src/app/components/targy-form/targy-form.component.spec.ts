import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargyFormComponent } from './targy-form.component';

describe('TargyFormComponent', () => {
  let component: TargyFormComponent;
  let fixture: ComponentFixture<TargyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
