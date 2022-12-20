import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-update-reference-number',
  templateUrl: './update-reference-number.component.html',
  styleUrls: ['./update-reference-number.component.scss']
})
export class UpdateReferenceNumberComponent implements OnInit {

  data: { paymentId: string };
  referenceNo: FormControl = new FormControl(null, [Validators.required]);
  isProcessing = false;
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
    public dialogRef: MatDialogRef<UpdateReferenceNumberComponent>
  ) {
    dialogRef.disableClose = true;
  }
  ngOnInit(): void {
  }

  get formData() {
    return {
      paymentId: this.data.paymentId,
      referenceNo: this.referenceNo.value,
    }
  }

  get formIsValid() {
    return this.referenceNo.valid &&
    this.data.paymentId &&
    this.data.paymentId !== "";
  }

  onSubmit(): void {
    const param = this.formData;
    if (this.formIsValid) {
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Confirm';
      dialogData.message = 'Save reference number?';
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
            await this.paymentService
              .updateReferenceNumber(param)
              .subscribe(
                async (res) => {
                  if (res.success) {
                    this.conFirm.emit(true);
                    this.snackBar.snackbarSuccess("Saved!");
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

