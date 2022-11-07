import { Component, Input, OnInit } from '@angular/core';
import { Messages } from 'src/app/core/model/messages.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() data: Messages;
  constructor() { }

  ngOnInit(): void {
  }

}
