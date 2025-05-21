import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KurzusListComponent } from './kurzus-list.component';

describe('KurzusListComponent', () => {
  let component: KurzusListComponent;
  let fixture: ComponentFixture<KurzusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KurzusListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KurzusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
