import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollStudentDialogComponent } from './enroll-student-dialog.component';

describe('EnrollStudentDialogComponent', () => {
  let component: EnrollStudentDialogComponent;
  let fixture: ComponentFixture<EnrollStudentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollStudentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollStudentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
