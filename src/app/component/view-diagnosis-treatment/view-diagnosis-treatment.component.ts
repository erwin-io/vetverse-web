import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { Appointment } from 'src/app/core/model/appointment.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PetService } from 'src/app/core/services/pet.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-view-diagnosis-treatment',
  templateUrl: './view-diagnosis-treatment.component.html',
  styleUrls: ['./view-diagnosis-treatment.component.scss']
})
export class ViewDiagnosisTreatmentComponent implements OnInit {
  data: { appointmentId: string; diagnosiAndTreatment: string };
  diagnosiAndTreatmentForm: FormGroup;
  conFirm = new EventEmitter();
  isProcessing = false;
  isLoading = false;
  isLoadingLookup = false;
  error;
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private appointmentService: AppointmentService,
    private appconfig: AppConfigService,
    public dialogRef: MatDialogRef<ViewDiagnosisTreatmentComponent>) {
      this.diagnosiAndTreatmentForm = this.formBuilder.group({
        diagnosiAndTreatment: ['', Validators.required],
      });
      dialogRef.disableClose = true;
     }

  ngOnInit(): void {
  }

  get f() { return this.diagnosiAndTreatmentForm.controls; }

  get formData() {
    return this.diagnosiAndTreatmentForm ? this.diagnosiAndTreatmentForm.value : {
      appointmentId: this.data.appointmentId,
      diagnosiAndTreatment: this.diagnosiAndTreatmentForm.value.diagnosiAndTreatment,
    };
  }


  onSubmit(): void {
    if (this.diagnosiAndTreatmentForm.valid) {
      const param = {
        ...this.formData,
        appointmentId: this.data.appointmentId,
      };
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Save';
      dialogData.message = 'Are you sure you want to save diagnosis and treatment?';
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
          console.log(param);
          try {
            await this.appointmentService
              .updateAppointmentDiagnosiAndTreatment(param)
              .subscribe(
                async (res) => {
                  if (res.success) {
                    this.conFirm.emit(true);
                    this.isProcessing = false;
                    this.snackBar.snackbarSuccess("Appointment updated!");
                    dialogRef.close();
                    this.dialogRef.close();
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

  getError(key:string){
    return this.f[key].errors;
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
