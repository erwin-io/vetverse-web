import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MyErrorStateMatcher } from 'src/app/core/form-validation/error-state.matcher';
import { UserService } from 'src/app/core/services/user.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { PetCategoryAddComponent } from 'src/app/pages/features/configuration/pet-category/pet-category-add/pet-category-add.component';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-update-user-password',
  templateUrl: './update-user-password.component.html',
  styleUrls: ['./update-user-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateUserPasswordComponent implements OnInit {
  updatePasswordForm: FormGroup;
  conFirm = new EventEmitter();
  data: { userId?: string } = {};
  isProcessing = false;
  isLoading = false;
  error;
  matcher = new MyErrorStateMatcher();
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private userService: UserService,
    public dialogRef: MatDialogRef<PetCategoryAddComponent>
  ) {
    this.updatePasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword : '',
    }, { validators: this.checkPasswords });
    dialogRef.disableClose = true;
  }


  get formData() {
    return {
      ...this.updatePasswordForm.value,
      userId: this.data.userId,
    };
  }

  get f() { return this.updatePasswordForm.controls; }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  };

  ngOnInit(): void {}

  getError(key:string){
    return this.f[key].errors;
  }

  onSubmit() {
    if (!this.updatePasswordForm.valid) {
      return;
    }
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
          userService
            .udpdatePassword(param)
            .subscribe(
              async (res) => {
                if (res.success) {
                  this.conFirm.emit(true);
                  this.snackBar.snackbarSuccess("Password updated!");
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

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
