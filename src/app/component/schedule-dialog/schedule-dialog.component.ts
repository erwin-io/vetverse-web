import { Time } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
@Component({
  selector: 'app-schedule-dialog',
  templateUrl: './schedule-dialog.component.html',
  styleUrls: ['./schedule-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ScheduleDialogComponent implements OnInit {
  data: any;
  time;
  appointmentDate: FormControl = new FormControl();
  // time:FormControl = new FormControl([null, Validators.required]);
  defaultValue: Date;
  isProcessing = false;
  appointmentTime;
  conFirm = new EventEmitter();
  isLoading = false;
  error;
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    private snackBar: Snackbar,
    public dialogRef: MatDialogRef<ScheduleDialogComponent>
  ) {
    dialogRef.disableClose = true;
    this.appointmentDate.addValidators([Validators.required]);
  }
  ngOnInit(): void {
    this.appointmentDate.setValue(this.data.appointmentDate);
    this.time = this.data.time;
  }

  get formValid() {
    return (
      this.appointmentDate.valid &&
      this.time &&
      (this.data.appointmentDate != this.appointmentDate.value ||
        this.time != this.data.time)
    );
  }

  onSubmit(): void {
    console.log(this.appointmentDate.value);
    if (this.formValid) {
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Save';
      dialogData.message = 'Are you save new schedule?';
      dialogData.confirmButton = {
        visible: true,
        text: 'yes',
        color: 'primary',
      };
      dialogData.dismissButton = {
        visible: true,
        text: 'cancel',
      };
      const dialogRef = this.dialog.open(AlertDialogComponent, {
        maxWidth: '400px',
        closeOnNavigation: true,
      });

      dialogRef.componentInstance.alertDialogConfig = dialogData;
      dialogRef.componentInstance.conFirm.subscribe(async (confirmed: any) => {
        if (confirmed) {
          this.isProcessing = true;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          const param = {
            appointmentId: this.data.appointmentId,
            appointmentDate: moment(this.appointmentDate.value).format(
              'YYYY-MM-DD'
            ),
            time: moment(this.time).format('hh:mm'),
          };
          console.log(param);
          try {
            await this.appointmentService
              .rescheduleAppointment(param)
              .subscribe(
                async (res) => {
                  if (res.success) {
                    this.conFirm.emit(true);
                    this.snackBar.snackbarSuccess("Appointment rescheduled!");
                    dialogRef.close();
                    this.isProcessing = false;
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                  } else {
                    this.isLoading = false;
                    this.error = Array.isArray(res.message)
                      ? res.message[0]
                      : res.message;
                    this.snackBar.snackbarError(this.error);
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                  }
                },
                async (err) => {
                  this.isProcessing = false;
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                }
              );
          } catch (e) {
            this.isProcessing = false;
            this.error = Array.isArray(e.message) ? e.message[0] : e.message;
            this.snackBar.snackbarError(this.error);
            dialogRef.componentInstance.isProcessing = this.isProcessing;
          }
        }
      });
    }
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
