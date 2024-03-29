import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { AddPaymentComponent } from 'src/app/component/add-payment/add-payment.component';
import { ScheduleDialogComponent } from 'src/app/component/schedule-dialog/schedule-dialog.component';
import { SelectTimeslotComponent } from 'src/app/component/select-timeslot/select-timeslot.component';
import { UpdateReferenceNumberComponent } from 'src/app/component/update-reference-number/update-reference-number.component';
import { ViewClientInfoComponent } from 'src/app/component/view-client-info/view-client-info.component';
import { ViewPetInfoComponent } from 'src/app/component/view-pet-info/view-pet-info.component';
import { ViewVeterinarianInfoComponent } from 'src/app/component/view-veterinarian-info/view-veterinarian-info.component';
import { WebcamCaptureComponent } from 'src/app/component/webcam-capture/webcam-capture.component';
import { AppointmentStatusEnum } from 'src/app/core/enums/appointment-status.enum';
import { RoleEnum } from 'src/app/core/enums/role.enum copy';
import { Appointment, Payment } from 'src/app/core/model/appointment.model';
import { Messages } from 'src/app/core/model/messages.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { MessageService } from 'src/app/core/services/message.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { ServiceTypeService } from 'src/app/core/services/service-type.service';
import { CustomSocket } from 'src/app/core/sockets/custom-socket.sockets';
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
  isUploading = false;
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
    connect: false,
  };
  appointmentAction = {
    add: false,
    payment: false,
    approval: false,
    complete: false,
    cancelation: false,
    reschedule: false,
  };
  messages: any[] = [];
  currentMessagePage = 0;
  loadingMessage = false;
  isSendingMessage = false;
  connect = false;
  tabIndex = 1;
  diagnosisAndTreatment: FormControl = new FormControl(null, [Validators.required]);

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService,
    private serviceTypeService: ServiceTypeService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    public router: Router,
    private messageService: MessageService,
    private socket: CustomSocket,
  ) {
    this.initAllowedAction();
  }

  get getSelectedIndex() {
    return this.connect ? 1 : 0;
  }

  get isVideoConferenceAvailable() {
    if(this.isLoading) {
      return false;
    } else {
      const today: any = new Date();
      const appointmentDateStr = moment(`${this.appointment.appointmentDate} ${this.appointment.timeStart}`).format('YYYY-MM-DD h:mm a');
      const date: any = new Date(appointmentDateStr);
      const diffTime = today - date;
      return diffTime > 0 ? true : Math.abs(diffTime) <= 600000;
    }
  }

  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoginUser().userId;
    const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
    this.initAppointment(appointmentId);

    this.socket.fromEvent('messageAdded').subscribe((message) => {
      const newMessages: Messages[] = [];
      newMessages.push(message as Messages);
      this.messages = [ ...newMessages, ...this.messages ];
    });
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
      this.allowedAction.connect =
        this.storageService.getLoginUser().role.roleId ===
          this.roleEnum.VET.toString();

      console.log(this.allowedAction);
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
            this.initMessages(appointmentId);
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
    // const dialogRef = this.dialog.open(ScheduleDialogComponent, {
    //   maxWidth: '1000px',
    //   closeOnNavigation: true,
    //   panelClass: 'schedule-dialog',
    // });
    // dialogRef.componentInstance.data = {
    //   appointmentId: this.appointment.appointmentId,
    //   appointmentDate: new Date(this.appointment.appointmentDate),
    //   time: new Date(
    //     `${this.appointment.appointmentDate} ${this.appointment.timeStart}`
    //   ),
    // };
    // dialogRef.componentInstance.conFirm.subscribe((data: any) => {
    //   dialogRef.close();
    //   this.currentUserId = this.storageService.getLoginUser().userId;
    //   const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
    //   this.initAppointment(appointmentId);
    // });

    const dialogRef = this.dialog.open(SelectTimeslotComponent, {
      closeOnNavigation: true,
      panelClass: 'select-timeslot-dialog',
    });
    dialogRef.componentInstance.data = {
      appointmentDate: new Date(moment(this.appointment.appointmentDate).format("YYYY-MM-DD")),
      selectTime: moment(new Date(
            `${this.appointment.appointmentDate} ${this.appointment.timeStart}`
          )).format("HH:mm"),
      durationInHours: Number(this.appointment.serviceType.durationInHours),
      minDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      appointmentId: this.appointment.appointmentId,
      reschedule: true
    };
    dialogRef.componentInstance.conFirm.subscribe(async (data: { appointmentDate: Date; selectTime: string}) => {
        this.currentUserId = this.storageService.getLoginUser().userId;
        const appointmentId = this.route.snapshot.paramMap.get('appointmentId');
        this.initAppointment(appointmentId);
      dialogRef.close();
    });
  }

  changeStatus(appointmentStatusId: number) {
    const status = [2,3,4];
    if(!status.includes(appointmentStatusId)){
      return;
    }
    const params = {
      appointmentId: this.appointment.appointmentId,
      appointmentStatusId: appointmentStatusId,
      isUpdatedByClient: false
    };
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

    dialogRef.componentInstance.alertDialogConfig = dialogData;
    dialogRef.componentInstance.conFirm.subscribe(async (confirm: any) => {
      if(confirm) {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        try {
          this.appointmentService
            .updateAppointmentStatus(params)
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

  uppdateReference() {
    const dialogRef = this.dialog.open(UpdateReferenceNumberComponent, {
      closeOnNavigation: false,
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.componentInstance.data = {
      paymentId: this.payment.paymentId
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

  async viewClientInfo(userId) {
    const dialogRef = this.dialog.open(ViewClientInfoComponent, {
      closeOnNavigation: false,
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.componentInstance.userId = userId;
  }

  async viewPetInfo(pet) {
    const dialogRef = this.dialog.open(ViewPetInfoComponent, {
      closeOnNavigation: false,
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.componentInstance.petData = pet;
  }

  async viewVetInfo(userId) {
    const dialogRef = this.dialog.open(ViewVeterinarianInfoComponent, {
      closeOnNavigation: false,
      maxWidth: '500px',
      width: '500px',
    });
    dialogRef.componentInstance.userId = userId;
  }

  async initMessages(appointmentId) {
    this.loadingMessage = true;
    try {
      this.messageService.getByAppointmentPage({
        appointmentId: appointmentId,
        page: this.currentMessagePage,
        limit: 40
      }).subscribe(
        (res) => {
          if (res.success) {
            this.messages = [ ...this.messages, ...res.data.items];
            this.currentMessagePage = res.data.meta.currentPage;
            this.loadingMessage = false;
          } else {
            this.loadingMessage = false;
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
          this.loadingMessage = false;
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
      this.loadingMessage = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if (this.error.toLowerCase().includes('not found')) {
        this.router.navigate(['/appointments/']);
      }
    }
  }
  async loadMoreMessage() {
    this.currentMessagePage = this.currentMessagePage + 1;
    this.initMessages(this.appointment.appointmentId)
  }

  async sendMessage(messageInput) {
    const message = messageInput.value;
    const param = {
      message,
      isClient: false,
      appointmentId: this.appointment.appointmentId,
      fromUserId: this.currentUserId,
      toUserId: this.appointment.clientAppointment.client.user.userId,
    };
    this.isSendingMessage = true;
    const messages: any [] = [];
    messages.push({
      message,
      dateTime: new Date(),
      fromUser: { userId: this.currentUserId },
      isClient: false,
      isSending: true
    });
    this.messages = [...messages,...this.messages];
    messageInput.value = null;
    try {
      await this.
      messageService
        .add(param)
        .subscribe(
          async (res) => {
            if (res.success) {
              this.messages.filter(x=> Number(x.fromUser.userId) === Number(this.currentUserId))[0].isSending = false;
              this.isSendingMessage = false;
            } else {
              this.isSendingMessage = false;
              this.error = Array.isArray(res.message)
                ? res.message[0]
                : res.message;
              this.snackBar.snackbarError(this.error);
            }
          },
          async (err) => {
            this.isSendingMessage = false;
            this.error = Array.isArray(err.message)
              ? err.message[0]
              : err.message;
            this.snackBar.snackbarError(this.error);
          }
        );
    } catch (e) {
      this.isSendingMessage = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  async startVideoConference(){
    this.router.navigate(['/video-conference/' + this.appointment.appointmentId]);
  }

  async saveDiagnosisAndTreatment() {
    if (this.diagnosisAndTreatment.valid) {
      const param = {
        appointmentId: this.appointment.appointmentId,
        diagnosisAndTreatment: this.diagnosisAndTreatment.value,
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
          try {
            await this.appointmentService
              .updateAppointmentDiagnosisAndTreatment(param)
              .subscribe(
                async (res) => {
                  if (res.success) {
                    this.isProcessing = false;
                    this.snackBar.snackbarSuccess("Saved!");
                    dialogRef.close();
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

  
  async openWebCamAttachment(){
    const dialogRef = this.dialog.open(WebcamCaptureComponent, {
      closeOnNavigation: true,
      panelClass: 'webcam-capture-dialog',
    });
    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      if(data){
        console.log(data);
        const base64 = data._imageAsDataUrl.toString();
        const attachment = {
          appointmentId: this.appointment.appointmentId,
          fileName: `sample-file.${data._mimeType.split('/')[1]}`,
          data: base64.split(',')[1]
        };
        this.appointment.diagnosisAttachments.push({
          file: {
            url: base64,
          },
        });
        await this.uploadDiagnosisAttachmentFile(attachment);
      }
      dialogRef.close();
    });
  }

  async loadDiagnosisAndTreatmentAttachment(event) {
    try{
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result.toString();
        const attachment = {
          appointmentId: this.appointment.appointmentId,
          fileName: file.name,
          data: base64.split(',')[1]
        };
        this.appointment.diagnosisAttachments.push({
          file: {
            url: base64,
          }
        });

        await this.uploadDiagnosisAttachmentFile(attachment);
      };
      reader.onerror = (err) => {
        console.log(err);
      };
    }
    catch(ex) {
      console.log(ex);
    }
  };

  async uploadDiagnosisAttachmentFile(param) {
    try {
      this.isUploading = true;
      await this.appointmentService
        .addDiagnosisAttachmentFile(param)
        .subscribe(
          async (res) => {
            if (res.success) {
              this.appointment.diagnosisAttachments = res.data;
              this.isUploading = false;
              this.snackBar.snackbarSuccess("Uploaded!");
            } else {
              this.isLoading = false;
              this.error = Array.isArray(res.message)
                ? res.message[0]
                : res.message;
              this.snackBar.snackbarError(this.error);
            }
          },
          async (err) => {
            this.isUploading = false;
            this.error = Array.isArray(err.message)
              ? err.message[0]
              : err.message;
            this.snackBar.snackbarError(this.error);
          }
        );
    } catch (e) {
      this.isUploading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  async removeDiagnosisAttachmentFile(diagnosisAttachmentsId) {
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Remove';
      dialogData.message = 'Are you sure you want to remove attachment?';
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
          try {
          this.isUploading = true;
          dialogRef.componentInstance.isProcessing = this.isUploading;
          await this.appointmentService
            .removeDiagnosisAttachmentFile(diagnosisAttachmentsId)
            .subscribe(
              async (res) => {
                if (res.success) {
                  this.appointment.diagnosisAttachments = res.data;
                  this.isUploading = false;
                  this.snackBar.snackbarSuccess("Success!");
                  dialogRef.close();
                  dialogRef.componentInstance.isProcessing = this.isUploading;
                } else {
                  dialogRef.close();
                  this.isLoading = false;
                  dialogRef.componentInstance.isProcessing = this.isUploading;
                  this.error = Array.isArray(res.message)
                    ? res.message[0]
                    : res.message;
                  this.snackBar.snackbarError(this.error);
                }
              },
              async (err) => {
                dialogRef.close();
                this.isUploading = false;
                dialogRef.componentInstance.isProcessing = this.isUploading;
                this.error = Array.isArray(err.message)
                  ? err.message[0]
                  : err.message;
                this.snackBar.snackbarError(this.error);
              }
            );
        } catch (e) {
          dialogRef.close();
          this.isUploading = false;
          dialogRef.componentInstance.isProcessing = this.isUploading;
          this.error = Array.isArray(e.message) ? e.message[0] : e.message;
          this.snackBar.snackbarError(this.error);
        }
      }
    });
  }

  async onAttachmentThumbnailClick(url) {
    if(this.isUploading){
      return;
    }
    console.log(url);
    window.open(url, "_blank")
  }
}
