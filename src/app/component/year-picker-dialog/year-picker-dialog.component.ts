import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-year-picker-dialog',
  templateUrl: './year-picker-dialog.component.html',
  styleUrls: ['./year-picker-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class YearPickerDialogComponent implements OnInit {
  selected: Date;
  conFirm = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }
  yearSelectedHandler(event) {
    this.conFirm.emit({ year: new Date(event).getFullYear()});
  }
}
