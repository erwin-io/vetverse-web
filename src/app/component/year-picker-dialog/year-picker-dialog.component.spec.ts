import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearPickerDialogComponent } from './year-picker-dialog.component';

describe('YearPickerDialogComponent', () => {
  let component: YearPickerDialogComponent;
  let fixture: ComponentFixture<YearPickerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YearPickerDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearPickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
