import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
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
  isClient: boolean;
  peerId: string;
  isMicOff = false;
  error;
  isLoading = false;

  @ViewChild('localVideo') localVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo: ElementRef<HTMLVideoElement>;

  constructor(private callService: CallService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: Snackbar,
    private appointmentService: AppointmentService) {
      this.askPermission();
      this.isCallStarted$ = this.callService.isCallStarted$;

      this.appointmentId = this.route.snapshot.paramMap.get('appointmentId');
      const isClient = this.route.snapshot.data['isClient'];
      this.isClient = isClient && isClient !== undefined ? true : false
      console.log('this.route.snapshot ', this.route.snapshot);
      console.log('this.isClient ', this.isClient);
      if(!this.isClient) {
        this.peerId = this.callService.initPeer();
        this.setConferencePeer(this.peerId);
        this.createOnline$().subscribe(isOnline => console.log(isOnline));
      }else {
        this.peerId = this.route.snapshot.paramMap.get('peerId');
        this.callService.initPeer();
      }
  }

  get callStarted(){
    return this.isCallStarted$;
  }

  get connected() {
    return this.remoteVideo ? !this.remoteVideo.nativeElement.paused : false;
  }

  async askPermission() {
    const status = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log(status);
  }

  ngOnInit(): void {
    this.callService.localStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.localVideo.nativeElement.srcObject = stream);
    this.callService.remoteStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.remoteVideo.nativeElement.srcObject = stream);
      if(!this.isClient) {
        this.callService.enableCallAnswer();
      }
      else {
        this.getAppointmentConferencePeer(this.appointmentId);
      }
  }

  getAppointmentConferencePeer(appointmentId) {
    this.isLoading = true;
    try {
      this.appointmentService.getAppointmentConferencePeer(appointmentId).subscribe(
        (res) => {
          if (res.success) {
            console.log(res.data);
            this.peerId = res.data;
            this.callService.establishMediaCall(this.peerId);
          } else {
            this.isLoading = false;
            this.error = Array.isArray(res.message)
              ? res.message[0]
              : res.message;
            this.snackBar.snackbarError(this.error);
            if (this.error.toLowerCase().includes('not found')) {
              this.closeWindow();
            }
          }
        },
        async (err) => {
          this.isLoading = false;
          this.error = Array.isArray(err.message)
            ? err.message[0]
            : err.message;
          this.snackBar.snackbarError(this.error);
          if (this.error.toLowerCase().includes('not found')) {
            this.closeWindow();
          }
        }
      );
    } catch (e) {
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if (this.error.toLowerCase().includes('not found')) {
        this.closeWindow();
      }
    }
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
    if(!this.isClient) {
      await this.setConferencePeer('').then(()=> {
        this.closeWindow();
      }).catch((err)=> {
        console.log(err);
      });
    }
  }

  closeWindow() {
    this.router.navigate(['appointments/details/'+this.appointmentId])
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
      $event.returnValue = false;
      $event.preventDefault();
      $event.stopPropagation();
      $event.stopImmediatePropagation();
      if(!this.isClient) {
        await this.setConferencePeer('');
      }
      return false;
  }

}
