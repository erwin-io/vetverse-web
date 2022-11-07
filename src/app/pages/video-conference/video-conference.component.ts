import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, of, fromEvent, map, merge, Observer } from 'rxjs';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { CallService } from 'src/app/core/services/call.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-video-conference',
  templateUrl: './video-conference.component.html',
  styleUrls: ['./video-conference.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoConferenceComponent implements OnInit, OnDestroy {

  public isCallStarted$: Observable<boolean>;
  private appointmentId: string;
  private peerId: string;
  isMicOff = false;
  error;

  @ViewChild('localVideo') localVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo: ElementRef<HTMLVideoElement>;

  constructor(private callService: CallService,
    private route: ActivatedRoute,
    private snackBar: Snackbar,
    private appointmentService: AppointmentService) {
    this.isCallStarted$ = this.callService.isCallStarted$;
    this.peerId = this.callService.initPeer();

    window.onbeforeunload = confirmExit;
    function confirmExit() {
        return "You have attempted to leave this page. Are you sure?";
    }
    console.log(` PeerId ${this.peerId}`);
    this.appointmentId = this.route.snapshot.paramMap.get('appointmentId');

    this.setConferencePeer(this.peerId);
    this.createOnline$().subscribe(isOnline => console.log(isOnline));

    window.addEventListener('onbeforeunload', ()=> {
      return '';
    })
    window.onbeforeunload = function(e) {
      return 'Dialog text here.';
    };
  }

  get callStarted(){
    return this.isCallStarted$;
  }

  ngOnInit(): void {
    this.callService.localStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.localVideo.nativeElement.srcObject = stream);
    this.callService.remoteStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.remoteVideo.nativeElement.srcObject = stream);
      this.callService.enableCallAnswer();
  }

  async setConferencePeer(conferencePeerId) {
    try {
      await this.appointmentService
        .updateAppointmentConferencePeer({appointmentId: this.appointmentId, conferencePeerId: conferencePeerId })
        .subscribe(
          async (res) => {
            console.log(res);
            if (res.success) {
            } else {
              this.error = Array.isArray(res.message)
                ? res.message[0]
                : res.message;
              this.snackBar.snackbarError(this.error);
            }
          },
          async (err) => {
            this.error = Array.isArray(err.message)
              ? err.message[0]
              : err.message;
            this.snackBar.snackbarError(this.error);
          }
        );
    } catch (e) {
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  ngOnDestroy(): void {
    this.callService.destroyPeer();
  }

  async endCall() {
    await this.setConferencePeer('').then(()=> {
      var callWindow = window.self;
      callWindow.opener = window.self;
      callWindow.close();
    }).catch((err)=> {
      console.log(err);
    });
  }

  createOnline$() {
    return merge<any>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }
  @HostListener('window:beforeunload', ['$event'])
  async handleClose($event) {
    debugger;
      $event.returnValue = false;
      $event.preventDefault();
      $event.stopPropagation();
      $event.stopImmediatePropagation();
      await this.setConferencePeer('');
      return false;
  }

}
