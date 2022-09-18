import { trigger } from '@angular/animations';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { forkJoin, map, Observable, startWith, Subscription, switchMap } from 'rxjs';
import { AddPaymentComponent } from 'src/app/component/add-payment/add-payment.component';
import { ScheduleDialogComponent } from 'src/app/component/schedule-dialog/schedule-dialog.component';
import { SelectPeopleComponent } from 'src/app/component/select-people/select-people.component';
import { AppointmentStatusEnum } from 'src/app/core/enums/appointment-status.enum';
import { RoleEnum } from 'src/app/core/enums/role.enum copy';
import { Appointment, ConsultaionType, Payment, Pet, ServiceType } from 'src/app/core/model/appointment.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { PetService } from 'src/app/core/services/pet.service';
import { ServiceTypeService } from 'src/app/core/services/service-type.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateAppointmentComponent implements OnInit {

  isWalkIn = false;
  clientId: string;
  clientName: FormControl = new FormControl();
  petId: FormControl = new FormControl();
  petName: FormControl = new FormControl();
  peTypeLookup: Pet[] = [];
  appointmentDate: FormControl = new FormControl();
  time;
  veterinarianId: string;
  veterinarian: FormControl = new FormControl();
  serviceType = new FormControl<ServiceType>(null, Validators.required);
  comments: FormControl = new FormControl();
  serviceTypeLookup:ServiceType[] = [];
  paymentTypeLookup:any[] = [];
  payment: {
    amount: number,
    paymentDate: string;
    paymentTypeId: string;
  };

  currentUserId: string;
  isLoading = false;
  isLoadingPet = false;
  isProcessing = false;
  isLoadingFilter = false;
  error;
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
    private petService: PetService,
    private serviceTypeService: ServiceTypeService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    public router: Router
  ) {
    this.appointmentDate.addValidators([Validators.required]);
    this.clientName.addValidators([Validators.required]);
    this.petId.addValidators([Validators.required]);
    this.petName.addValidators([Validators.required]);
    this.veterinarian.addValidators([Validators.required]);
    this.comments.addValidators([Validators.required]);
    this.initAllowedAction();
    this.initFilter();
    if(!this.allowedAction.add){
      this.error = "Not allowed!"
      this.snackBar.snackbarError(this.error);
      this.router.navigate(['/appointments/']);
    }
  }

  ngOnInit(): void {
  }

  initFilter(){
    this.isLoadingFilter = true;
    forkJoin(
      this.serviceTypeService.get()
  ).subscribe(
      ([getServiceTypeLookup]) => {
          // do things
          this.serviceTypeLookup = getServiceTypeLookup.data;
          this.paymentTypeLookup = <any[]>this.appconfig.config.lookup.paymentType;
      },
      (error) => console.error(error),
      () => {
        ;
        this.isLoadingFilter = false;
      }
  )
  }

  get isPaid() {
    return this.payment !== undefined && this.payment !== null;
  }

  get selectedPaymentType() {
    return this.paymentTypeLookup.length > 0 && this.payment ? this.paymentTypeLookup.filter(x=>x.paymentTypeId === this.payment.paymentTypeId)[0] : null;
  }

  get formIsValid() {
    return this.appointmentDate.valid &&
    (this.time && this.time !== "") &&
    this.serviceType.valid &&
    (this.isWalkIn ? this.clientName.valid : (this.clientId && this.clientId !== "")) &&
    (this.isWalkIn ? this.petName.valid : this.petId.valid) &&
    (this.veterinarianId && this.veterinarianId !== "") &&
    this.comments.valid &&
    (this.isPaid);
  }

  get formData() {
    return this.isWalkIn ? {
      appointmentDate: moment(this.appointmentDate.value.toString()).format("YYYY-MM-DD"),
      time: moment(this.time.toString()).format("hh:mm"),
      veterenarianId: this.veterinarianId,
      serviceTypeId: this.serviceType.value?.serviceTypeId,
      comments: this.comments.value,
      paymentDate: this.payment.paymentDate,
      paymentTypeId: this.payment.paymentTypeId,
      clientName: this.clientName.value,
      petName: this.petName.value,
    } : {
      appointmentDate: moment(this.appointmentDate.value.toString()).format("YYYY-MM-DD"),
      time: moment(this.time.toString()).format("hh:mm"),
      veterenarianId: this.veterinarianId,
      serviceTypeId: this.serviceType.value?.serviceTypeId,
      comments: this.comments.value,
      paymentDate: this.payment.paymentDate,
      paymentTypeId: this.payment.paymentTypeId,
      clientId: this.clientId,
      petId: this.petId.value.toString(),
    }
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

  async openSearchVet(){
    const dialogRef = this.dialog.open(SelectPeopleComponent, {
      closeOnNavigation: true,
      panelClass: 'select-vet-dialog',
    });
    dialogRef.componentInstance.typeId = 1;
    dialogRef.componentInstance.conFirm.subscribe((data: { id: string, fullName: string }) => {
      if(data){
        this.veterinarianId = data.id;
        this.veterinarian.setValue(data.fullName);
      }
      dialogRef.close();
    });
  }


  async openSearchClient(){
    const dialogRef = this.dialog.open(SelectPeopleComponent, {
      closeOnNavigation: true,
      panelClass: 'select-client-dialog',
    });
    dialogRef.componentInstance.typeId = 2;
    dialogRef.componentInstance.conFirm.subscribe(async (data: { id: string, fullName: string }) => {
      if(data){
        this.clientId = data.id;
        this.clientName.setValue(data.fullName);
       await  this.loadPets();
      }
      dialogRef.close();
    });
  }

  async loadPets(){

    this.isLoadingPet = true;
    try{
      const clientId = this.clientId;
      await this.petService.get()
      .subscribe(async res => {
        if(res.success){
          this.peTypeLookup = res.data.length > 0 ? res.data.filter(x=>x.client.clientId === clientId) : [];
          this.isLoadingPet = false;
        }
        else{
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          this.isLoadingPet = false;
        }
      }, async (err) => {
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        this.isLoadingPet = false;
      });
    }
    catch(e){
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      this.isLoading = false;
    }
  }


  async pay() {
    const dialogRef = this.dialog.open(AddPaymentComponent, {
      maxWidth: '1000px',
      closeOnNavigation: true,
      panelClass: 'payment-dialog',
    });
    dialogRef.componentInstance.data = {
      newAppointment: true,
      paymentDate: new Date(moment(this.appointmentDate.value.toString()).format("YYYY-MM-DD")),
    };
    dialogRef.componentInstance.conFirm.subscribe((data: { paymentDate: string,  paymentTypeId: string,}) => {
      console.log(data);
      const selectedServiceType = this.serviceType.value;
      this.payment = {
        amount: selectedServiceType.price,
        paymentDate: data.paymentDate,
        paymentTypeId: data.paymentTypeId
      }
      dialogRef.close();
      this.snackBar.snackbarSuccess("Payment added!");
    });
  }

  async cancelPayment(){
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm?';
    dialogData.message = 'Cancel payment?';
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
        this.payment = null;
        this.snackBar.snackbarSuccess("Payment cancelled!");
      }
      dialogRef.close();
    });
  }

  async onSubmit(){
    if(!this.formIsValid) return;
    const param = this.formData;
    console.log(param);
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm?';
    if(this.payment && Number(this.payment.paymentTypeId) === 1){
      dialogData.message = 'Save Appointment with Cash?';
    }else if(this.payment && Number(this.payment.paymentTypeId) === 2) {
      dialogData.message = 'Save Appointment with Cashless(G-Cash?)';
    }else {
      dialogData.message = 'Save Appointment?';
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
          if(this.isWalkIn){
            await this.appointmentService
              .createWalkInAppointment(param)
              .subscribe(
                async (res) => {
                  if (res.success) {
                    this.snackBar.snackbarSuccess("Appointment saved!");
                    dialogRef.close();
                    this.isProcessing = false;
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                    this.router.navigate(['/appointments/details/' + res.data.appointmentId]);
                  } else {
                    this.error = Array.isArray(res.message)
                      ? res.message[0]
                      : res.message;
                    this.snackBar.snackbarError(this.error);
                    this.isProcessing = false;
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                  }
                },
                async (err) => {
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                }
              );
          }
          else {
            await this.appointmentService
              .createOnsiteAppointment(param)
              .subscribe(
                async (res) => {
                  if (res.success) {
                    this.snackBar.snackbarSuccess("Appointment saved!");
                    dialogRef.close();
                    this.isProcessing = false;
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                    this.router.navigate(['/appointments/details/' + res.data.appointmentId]);
                  } else {
                    this.error = Array.isArray(res.message)
                      ? res.message[0]
                      : res.message;
                    this.snackBar.snackbarError(this.error);
                    this.isProcessing = false;
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                  }
                },
                async (err) => {
                  this.error = Array.isArray(err.message)
                    ? err.message[0]
                    : err.message;
                  this.snackBar.snackbarError(this.error);
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
                }
              );
            }
        } catch (e) {
          this.error = Array.isArray(e.message) ? e.message[0] : e.message;
          this.snackBar.snackbarError(this.error);
          this.isLoading = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
        }

      }
    });
  }
}
