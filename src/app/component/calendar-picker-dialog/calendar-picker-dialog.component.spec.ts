import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarPickerDialogComponent } from './calendar-picker-dialog.component';

describe('CalendarPickerDialogComponent', () => {
  let component: CalendarPickerDialogComponent;
  let fixture: ComponentFixture<CalendarPickerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarPickerDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarPickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
