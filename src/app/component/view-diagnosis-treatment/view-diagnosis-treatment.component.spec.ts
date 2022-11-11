import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDiagnosisTreatmentComponent } from './view-diagnosis-treatment.component';

describe('ViewDiagnosisTreatmentComponent', () => {
  let component: ViewDiagnosisTreatmentComponent;
  let fixture: ComponentFixture<ViewDiagnosisTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDiagnosisTreatmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDiagnosisTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
