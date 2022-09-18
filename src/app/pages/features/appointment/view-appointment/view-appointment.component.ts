import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { AddPaymentComponent } from 'src/app/component/add-payment/add-payment.component';
import { ScheduleDialogComponent } from 'src/app/component/schedule-dialog/schedule-dialog.component';
import { AppointmentStatusEnum } from 'src/app/core/enums/appointment-status.enum';
import { RoleEnum } from 'src/app/core/enums/role.enum copy';
import { Appointment, Payment } from 'src/app/core/model/appointment.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { ServiceTypeService } from 'src/app/core/services/service-type.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-view-appointment',
  templateUrl: './view-appointment.component.html',
  styleUrls: ['./view-appointment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAppointmentComponent implements OnInit {
  appointment: Appointment;
  payment: Payment;
  currentUserId: string;
  mediaWatcher: Subscription;
  isLoading = false;
  isProcessing = false;
  isLoadingRoles = false;
  error;
  statusEnum = AppointmentStatusEnum;
  roleEnum = RoleEnum;
  allowedAction = {
    add: false,
    payment: false,
    approval: false,
    complete: false,
    cancelation: false,
    reschedule: false,
  };
  appointmentAction = {
    add: false,
    payment: false,
    approval: false,
    complete: false,
    cancelation: false,
    reschedule: false,
  };
  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService,
    private serviceTypeService: ServiceTypeService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    public router: Router
  ) {
    this.initAllowedAction();
  }

  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoginUser().userId;
    const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
    this.initAppointment(appointmentId);

  }

  initAllowedAction() {
    this.allowedAction.add =
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.ADMIN.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.FRONTDESK.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.MANAGER.toString();
    this.allowedAction.approval =
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.ADMIN.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.VET.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.MANAGER.toString();
    this.allowedAction.complete =
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.ADMIN.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.VET.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.MANAGER.toString();
    this.allowedAction.cancelation =
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.ADMIN.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.FRONTDESK.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.MANAGER.toString();
    this.allowedAction.reschedule =
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.ADMIN.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.VET.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.FRONTDESK.toString() ||
      this.storageService.getLoginUser().role.roleId ===
        this.roleEnum.MANAGER.toString();
      this.allowedAction.payment =
        this.storageService.getLoginUser().role.roleId ===
          this.roleEnum.ADMIN.toString() ||
        this.storageService.getLoginUser().role.roleId ===
          this.roleEnum.FRONTDESK.toString() ||
        this.storageService.getLoginUser().role.roleId ===
          this.roleEnum.MANAGER.toString();
  }

  initAppointmentAction() {
    this.appointmentAction.approval = this.appointment.appointmentStatus.appointmentStatusId ===
    this.statusEnum.PENDING.toString();
    this.appointmentAction.complete = this.appointment.isPaid && this.appointment.appointmentStatus.appointmentStatusId ===
      this.statusEnum.APPROVED.toString();
    this.appointmentAction.cancelation = !this.appointment.isPaid &&
    this.appointment.appointmentStatus.appointmentStatusId ===
      this.statusEnum.PENDING.toString();
    this.appointmentAction.reschedule = this.appointment.appointmentStatus.appointmentStatusId ===
    this.statusEnum.PENDING.toString();
  }

  initAppointment(appointmentId: string) {
    this.isLoading = true;
    try {
      this.appointmentService.getById(appointmentId).subscribe(
        (res) => {
          if (res.success) {
            console.log(res.data);
            this.appointment = res.data;
            this.payment = res.data.payments && res.data.payments.length > 0 ? res.data.payments.filter(x=>!x.isVoid)[0] : null;
            this.initAppointmentAction();
            this.isLoading = false;
          } else {
            this.isLoading = false;
            this.error = Array.isArray(res.message)
              ? res.message[0]
              : res.message;
            this.snackBar.snackbarError(this.error);
            if (this.error.toLowerCase().includes('not found')) {
              this.router.navigate(['/appointments/']);
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
            this.router.navigate(['/appointments/']);
          }
        }
      );
    } catch (e) {
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if (this.error.toLowerCase().includes('not found')) {
        this.router.navigate(['/appointments/']);
      }
    }
  }

  async onReschedule() {
    const dialogRef = this.dialog.open(ScheduleDialogComponent, {
      maxWidth: '1000px',
      closeOnNavigation: true,
      panelClass: 'schedule-dialog',
    });
    dialogRef.componentInstance.data = {
      appointmentId: this.appointment.appointmentId,
      appointmentDate: new Date(this.appointment.appointmentDate),
      time: new Date(
        `${this.appointment.appointmentDate} ${this.appointment.timeStart}`
      ),
    };
    dialogRef.componentInstance.conFirm.subscribe((data: any) => {
      dialogRef.close();
      this.currentUserId = this.storageService.getLoginUser().userId;
      const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
      this.initAppointment(appointmentId);
    });
  }

  changeStatus(appointmentStatusId: number) {
    const status = [2,3,4];
    if(!status.includes(appointmentStatusId)){
      return;
    }
    const dialogData = new AlertDialogModel();
    if(appointmentStatusId === 2) {
      dialogData.title = 'Confirm Approve';
      dialogData.message = 'Approve appointment?';
    }
    else if(appointmentStatusId === 3) {
      dialogData.title = 'Confirm Complete';
      dialogData.message = 'Complete appointment?';
    }
    else if(appointmentStatusId === 4) {
      dialogData.title = 'Confirm Complete';
      dialogData.message = 'Complete appointment?';
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

    const appointmentId = this.appointment.appointmentId;

    dialogRef.componentInstance.alertDialogConfig = dialogData;
    dialogRef.componentInstance.conFirm.subscribe(async (confirm: any) => {
      if(confirm) {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        try {
          this.appointmentService
            .updateAppointmentStatus({
              appointmentId: appointmentId,
              appointmentStatusId: appointmentStatusId,
            })
            .subscribe(
              async (res) => {
                if (res.success) {
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  if(appointmentStatusId === this.statusEnum.APPROVED) {
                    this.snackBar.snackbarSuccess("Appointment approved!");
                  }
                  else if(appointmentStatusId === this.statusEnum.COMPLETED) {
                    this.snackBar.snackbarSuccess("Appointment completed!");
                  }
                  else if(appointmentStatusId === this.statusEnum.CANCELLED) {
                    this.snackBar.snackbarSuccess("Appointment cancelled!");
                  }
                  this.initAppointment(this.appointment.appointmentId);
                } else {
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                  this.error = Array.isArray(res.message)
                    ? res.message[0]
                    : res.message;
                  this.snackBar.snackbarError(this.error);
                }
              },
              async (err) => {
                this.isProcessing = false;
                dialogRef.componentInstance.isProcessing = this.isProcessing;
                this.error = Array.isArray(err.message)
                  ? err.message[0]
                  : err.message;
                this.snackBar.snackbarError(this.error);
              }
            );
        } catch (e) {
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          this.error = Array.isArray(e.message) ? e.message[0] : e.message;
          this.snackBar.snackbarError(this.error);
        }
      }
    });
  }


  async pay() {
    const dialogRef = this.dialog.open(AddPaymentComponent, {
      maxWidth: '1000px',
      closeOnNavigation: true,
      panelClass: 'payment-dialog',
    });
    dialogRef.componentInstance.data = {
      newAppointment: false,
      appointmentId: this.appointment.appointmentId,
      paymentDate: new Date(this.appointment.appointmentDate),
    };
    dialogRef.componentInstance.conFirm.subscribe((data: any) => {
      dialogRef.close();
      this.currentUserId = this.storageService.getLoginUser().userId;
      const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
      this.initAppointment(appointmentId);
    });
  }

  async voidPayment() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm void';
    dialogData.message = 'Void payment?';
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
    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      this.isProcessing = true;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      try {
        await this.paymentService
          .void({
            paymentId: this.payment.paymentId,
          })
          .subscribe(
            async (res) => {
              if (res.success) {
                this.isProcessing = false;
                dialogRef.componentInstance.isProcessing = this.isProcessing;
                this.snackBar.snackbarSuccess("Payment void!");
                await this.initAppointment(this.appointment.appointmentId);
                dialogRef.close();
              } else {
                this.isProcessing = false;
                dialogRef.componentInstance.isProcessing = this.isProcessing;
                this.error = Array.isArray(res.message)
                  ? res.message[0]
                  : res.message;
                this.snackBar.snackbarError(this.error);
              }
            },
            async (err) => {
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              this.error = Array.isArray(err.message)
                ? err.message[0]
                : err.message;
              this.snackBar.snackbarError(this.error);
            }
          );
      } catch (e) {
        this.isProcessing = false;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        this.error = Array.isArray(e.message) ? e.message[0] : e.message;
        this.snackBar.snackbarError(this.error);
      }
      // dialogRef.close();
    });
  }
}
