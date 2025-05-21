import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KurzusFormComponent } from './kurzus-form.component';

describe('KurzusFormComponent', () => {
  let component: KurzusFormComponent;
  let fixture: ComponentFixture<KurzusFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KurzusFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KurzusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
