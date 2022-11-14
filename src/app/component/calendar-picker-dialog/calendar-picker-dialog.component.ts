import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-calendar-picker-dialog',
  templateUrl: './calendar-picker-dialog.component.html',
  styleUrls: ['./calendar-picker-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CalendarPickerDialogComponent implements OnInit {
  selected: Date;
  startView = 'year'; //or multi-year
  conFirm = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }
  onSelect(event) {
    this.conFirm.emit({ year: new Date(event).getFullYear(), month: new Date(event).getMonth()},);
  }
}
