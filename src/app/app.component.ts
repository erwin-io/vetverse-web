import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Messages } from './core/model/messages.model';
import { CustomSocket } from './core/sockets/custom-socket.sockets';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'vetverse-web';
  grantNotif = false;
  constructor(private snackBar: MatSnackBar,
    private socket: CustomSocket) {
      this.socket.init();
      this.socket.fromEvent('messageAdded').subscribe((message: any) => {
        if(this.grantNotif) {
          const notify = new Notification(`New message from ${message.fromUser.username}`, {
            body: message.message,
            icon: '../assets/img/vector/app_banner.jpg'
          });
        }
        else {
          this.snackBar.open(`New message from ${message.fromUser.username}`);
        }
      });
      if (!window.Notification) {
        console.log('Browser does not support notifications.')
      } else {
        // check if permission is already granted
        if (Notification.permission === 'granted') {
          // show notification here
          this.grantNotif = true;
        } else {
          // request permission from the user
          Notification.requestPermission()
            .then(function (p) {
              if (p === 'granted') {
                // show notification here
              } else {
                console.log('User blocked notifications.')
              }
            })
            .catch(function (err) {
              console.error(err)
            })
        }
      }
  }
}
