import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OktatoListComponent } from './oktato-list.component';

describe('OktatoListComponent', () => {
  let component: OktatoListComponent;
  let fixture: ComponentFixture<OktatoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OktatoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OktatoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
