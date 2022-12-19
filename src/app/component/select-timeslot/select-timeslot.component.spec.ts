import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTimeslotComponent } from './select-timeslot.component';

describe('SelectTimeslotComponent', () => {
  let component: SelectTimeslotComponent;
  let fixture: ComponentFixture<SelectTimeslotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTimeslotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTimeslotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
