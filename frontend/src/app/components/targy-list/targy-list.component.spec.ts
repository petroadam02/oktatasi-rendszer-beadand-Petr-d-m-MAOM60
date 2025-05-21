import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargyListComponent } from './targy-list.component';

describe('TargyListComponent', () => {
  let component: TargyListComponent;
  let fixture: ComponentFixture<TargyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
