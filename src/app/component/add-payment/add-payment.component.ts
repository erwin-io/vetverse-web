import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { ScheduleDialogComponent } from '../schedule-dialog/schedule-dialog.component';

@Component({
  selector: 'app-add-payment',
  templateUrl: './add-payment.component.html',
  styleUrls: ['./add-payment.component.scss']
})
export class AddPaymentComponent  implements OnInit {
  data: { newAppointment?: boolean,appointmentId?:string,paymentDate:Date };
  paymentDate: FormControl = new FormControl();
  paymentTypeId: FormControl = new FormControl();
  referenceNo: FormControl = new FormControl();
  defaultValue: Date;
  isProcessing = false;
  appointmentTime;
  paymentTypeLookup:any[] = [];
  conFirm = new EventEmitter();
  isLoading = false;
  error;
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private paymentService: PaymentService,
    private snackBar: Snackbar,
    private appconfig: AppConfigService,
    public dialogRef: MatDialogRef<AddPaymentComponent>
  ) {
    this.paymentTypeId.valueChanges.subscribe(async (selectedValue: string) => {
      if(selectedValue === '2') {
        this.referenceNo = new FormControl('', [Validators.required]);
      } else {
        this.referenceNo = new FormControl('');
      }
    });
    dialogRef.disableClose = true;
    this.paymentDate.addValidators([Validators.required]);
    this.paymentTypeId.addValidators([Validators.required]);
    this.paymentTypeLookup = <any[]>this.appconfig.config.lookup.paymentType;
  }
  ngOnInit(): void {
    this.paymentDate.setValue(this.data.paymentDate);
  }

  get formData() {
    return {
      appointmentId: this.data.appointmentId,
      paymentDate: this.paymentDate.value,
      paymentTypeId: this.paymentTypeId.value,
      referenceNo: this.referenceNo.value,
    }
  }

  get formValid() {
    return (
      this.paymentDate.valid &&
      this.paymentTypeId.valid &&
      this.referenceNo.valid &&
      (this.data.newAppointment ? true : this.data.appointmentId !== undefined)
    );
  }

  onSubmit(): void {
    const param = this.formData;
    param.paymentDate = moment(param.paymentDate).format('YYYY-MM-DD');
    if (this.formValid) {
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Confirm payment';
      if(param.paymentTypeId === 1){
        dialogData.message = 'Pay appointment with Cash?';
      }else if(param.paymentTypeId === 2) {
        dialogData.message = 'Pay appointment with G-Cash?';
      }
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
          try {
            if(this.data.newAppointment && (this.data.appointmentId === "" || this.data.appointmentId === undefined) ) {
              this.conFirm.emit(param);
              dialogRef.close();
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
            }
            else {
              await this.paymentService
                .create(param)
                .subscribe(
                  async (res) => {
                    if (res.success) {
                      this.conFirm.emit(true);
                      this.snackBar.snackbarSuccess("Appointment paid!");
                      dialogRef.close();
                      this.isProcessing = false;
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    } else {
                      this.isProcessing = false;
                      this.error = Array.isArray(res.message)
                        ? res.message[0]
                        : res.message;
                      this.snackBar.snackbarError(this.error);
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    }
                  },
                  async (err) => {
                    this.isLoading = false;
                    this.error = Array.isArray(err.message)
                      ? err.message[0]
                      : err.message;
                    this.snackBar.snackbarError(this.error);
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                  }
                );
            }
          } catch (e) {
            this.isLoading = false;
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
