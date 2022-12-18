import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { ReminderService } from 'src/app/core/services/reminder.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-reminder-add',
  templateUrl: './reminder-add.component.html',
  styleUrls: ['./reminder-add.component.scss']
})
export class ReminderAddComponent implements OnInit {


  data: {
    reminderId?: string
  }
  title: FormControl = new FormControl(null, [Validators.required]);
  description: FormControl = new FormControl(null, [Validators.required]);
  dueDate: FormControl = new FormControl(null, [Validators.required]);
  time;
  conFirm = new EventEmitter();
  isProcessing = false;
  isLoading = false;
  error;
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private reminderService: ReminderService,
    private snackBar: Snackbar,
    private appconfig: AppConfigService,
    public dialogRef: MatDialogRef<ReminderAddComponent>
  ) {
    dialogRef.disableClose = true;
  }
  ngOnInit(): void {

    if(!this.isNew){
      this.getData();
    }
  }

  getData(){
    try {
      this.isLoading = true;
      this.
      reminderService
        .getById(this.data.reminderId)
        .subscribe(
          async (res) => {
            if (res.success) {
              this.title.setValue(res.data.title);
              this.description.setValue(res.data.description);
              this.dueDate.setValue(res.data.dueDate);
              this.isLoading = false;
            } else {
              this.isLoading = false;
              this.error = Array.isArray(res.message)
                ? res.message[0]
                : res.message;
              this.snackBar.snackbarError(this.error);
            }
          },
          async (err) => {
            this.isLoading = false;
            this.error = Array.isArray(err.message)
              ? err.message[0]
              : err.message;
            this.snackBar.snackbarError(this.error);
          }
        );
    }catch(err){
      this.isLoading = false;
      this.error = Array.isArray(err.message)
        ? err.message[0]
        : err.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  get isNew(){ return !this.data || !this.data.reminderId && this.data.reminderId === "" }

  get formData() {
    return {
      title: this.title.value,
      description: this.description.value,
      dueDate: new Date(`${moment(this.dueDate.value).format("YYYY-MM-DD")} ${moment(this.time).format("hh:mm a")}`),
      appointmentId: "",

    };
  }

  get formIsValid() {
    console.log(this.title.errors);
    return this.title.valid &&
    this.description.valid &&
    this.dueDate.valid &&
    (this.time && this.time !== "")
  }

  onSubmit(): void {
    console.log(this.formData);
    if (this.formIsValid) {
      const param = this.formData;
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Confirm';
      dialogData.message = 'Save?';
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
            await this.
            reminderService
              .add(param)
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
