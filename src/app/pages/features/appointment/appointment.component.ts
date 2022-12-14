import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Appointment, ServiceType } from 'src/app/core/model/appointment.model';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import * as moment from 'moment';
import { RoleEnum } from 'src/app/core/enums/role.enum copy';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ServiceTypeService } from 'src/app/core/services/service-type.service';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {
  error:string;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;
  allowedAction = {
    add:false,
    payment:false,
    completeAndApproval:false,
    cancelation:false,
    reschedule:false,
  }

  serviceLookup = [];

  isAdvanceSearch = false;
  isWalkIn = false;
  isLoadingFilter = false;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordCtrl = new FormControl('');
  clientNameCtrl = new FormControl('');
  vetNameCtrl = new FormControl('');
  appointmentDateFromCtrl = new FormControl(new Date());
  appointmentDateToCtrl = new FormControl(new Date());
  filterSearchStatusCtrl = new FormControl('');
  filterSearchConsultationCtrl = new FormControl('');
  filterSearchServiceCtrl = new FormControl('');

  filteredStatus: Observable<string[]>;
  filteredConsultation: Observable<string[]>;
  filteredServices: Observable<string[]>;

  selectedStatus: string[] = [];
  selectedConsultation: string[] = [];
  selectedServices: string[] = [];

  @ViewChild('filterSearchStatusInput') filterSearchStatusInput: ElementRef<HTMLInputElement>;
  @ViewChild('filterSearchConsultationInput') filterSearchConsultationInput: ElementRef<HTMLInputElement>;
  @ViewChild('filterSearchServiceInput') filterSearchServiceInput: ElementRef<HTMLInputElement>;

  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private appointmentService: AppointmentService,
    private serviceTypeService: ServiceTypeService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    public router: Router) {
      this.initFilter();
      this.initAllowedAction();
      this.getAppointments();
    }

  ngOnInit(): void {
    if(this.storageService.getLoginUser().role.roleId === RoleEnum.ADMIN.toString()) {
      this.displayedColumns = this.appconfig.config.tableColumns.appointment.admin;
    }
    if(this.storageService.getLoginUser().role.roleId === RoleEnum.MANAGER.toString()) {
      this.displayedColumns = this.appconfig.config.tableColumns.appointment.manager;
    }
    if(this.storageService.getLoginUser().role.roleId === RoleEnum.VET.toString()) {
      this.displayedColumns = this.appconfig.config.tableColumns.appointment.vet;
    }
    if(this.storageService.getLoginUser().role.roleId === RoleEnum.FRONTDESK.toString()) {
      this.displayedColumns = this.appconfig.config.tableColumns.appointment.frontDesk;
    }
    this.generateLoaderData(this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  get allStatus() {
    const _items = [];
    this.appconfig.config.lookup.appointmentStatus.forEach((i: any) => {
      _items.push(i);
    });
    return _items;
  }

  get allConsultation() {
    const _items = [];
    this.appconfig.config.lookup.consultaionType.forEach((i: any) => {
      _items.push(i);
    });
    return _items;
  }

  get allServices() {
    const _items = [];
    this.serviceLookup.forEach((i: any) => {
      _items.push(i);
    });
    return _items;
  }

  initFilter(){
    this.isLoadingFilter = true;
    forkJoin([
      this.serviceTypeService.get(),
  ]).subscribe(
      ([getServiceData]) => {
          // do things
          this.serviceLookup = getServiceData.data.map((s:ServiceType)=>{
            return s.name
          });
      },
      (error) => console.error(error),
      () => {
        this.selectedStatus = this.allStatus;
        this.selectedConsultation = this.allConsultation;
        this.selectedServices = this.allServices;
        this.filteredStatus = this.filterSearchStatusCtrl.valueChanges.pipe(
          startWith(null),
          map((value: string | null) => (value ? this.allStatus.filter(x=>x.toLowerCase().includes(value.toLowerCase())) : this.allStatus.slice())),
        );
        this.filteredConsultation = this.filterSearchConsultationCtrl.valueChanges.pipe(
          startWith(null),
          map((value: string | null) => (value ? this.allConsultation.filter(x=>x.toLowerCase().includes(value.toLowerCase())) : this.allConsultation.slice())),
        );
        this.filteredServices = this.filterSearchServiceCtrl.valueChanges.pipe(
          startWith(null),
          map((value: string | null) => (value ? this.allServices.filter(x=>x.toLowerCase().includes(value.toLowerCase())) : this.allServices.slice())),
        );
        this.isLoadingFilter = false;
      }
  )
  }

  remove(key: string, value: string): void {
    if(key === "status") {
      const index = this.selectedStatus.indexOf(value);

      if (index >= 0) {
        this.selectedStatus.splice(index, 1);
      }
    }
    if(key === "consultation") {
      const index = this.selectedConsultation.indexOf(value);

      if (index >= 0) {
        this.selectedConsultation.splice(index, 1);
      }
    }
    if(key === "service") {
      const index = this.selectedServices.indexOf(value);

      if (index >= 0) {
        this.selectedServices.splice(index, 1);
      }
    }
  }

  selected(key: string ,event: MatAutocompleteSelectedEvent): void {
    if(key === "status") {
      this.selectedStatus.push(event.option.viewValue);
      this.filterSearchStatusInput.nativeElement.value = '';
      this.filterSearchStatusCtrl.setValue(null);
    }
    if(key === "consultation") {
      this.selectedConsultation.push(event.option.viewValue);
      this.filterSearchConsultationInput.nativeElement.value = '';
      this.filterSearchConsultationCtrl.setValue(null);
    }
    if(key === "service") {
      this.selectedServices.push(event.option.viewValue);
      this.filterSearchServiceInput.nativeElement.value = '';
      this.filterSearchServiceCtrl.setValue(null);
    }
  }

  initAllowedAction(){
    this.allowedAction.add =
    (this.storageService.getLoginUser().role.roleId === RoleEnum.ADMIN.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.FRONTDESK.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.MANAGER.toString());
    this.allowedAction.completeAndApproval =
    (this.storageService.getLoginUser().role.roleId === RoleEnum.ADMIN.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.VET.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.MANAGER.toString());
    this.allowedAction.payment =
    (this.storageService.getLoginUser().role.roleId === RoleEnum.ADMIN.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.FRONTDESK.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.MANAGER.toString());
    this.allowedAction.cancelation =
    (this.storageService.getLoginUser().role.roleId === RoleEnum.ADMIN.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.FRONTDESK.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.MANAGER.toString());
    this.allowedAction.reschedule =
    (this.storageService.getLoginUser().role.roleId === RoleEnum.ADMIN.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.VET.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.FRONTDESK.toString() ||
    this.storageService.getLoginUser().role.roleId === RoleEnum.MANAGER.toString());
  }

  async getAppointments(){
    try{
      this.isLoading = true;
      await this.appointmentService.getByAdvanceSearch({
        isAdvance: this.isAdvanceSearch,
        keyword: this.keywordCtrl.value,
        isWalkIn: this.isWalkIn,
        clientName: this.clientNameCtrl.value,
        vetName: this.vetNameCtrl.value,
        appointmentStatus: this.selectedStatus.toString(),
        serviceType: this.selectedServices.toString(),
        consultaionType: this.selectedConsultation.toString(),
        appointmentDateFrom: moment(this.appointmentDateFromCtrl.value).format('YYYY-MM-DD'),
        appointmentDateTo: moment(this.appointmentDateToCtrl.value).format('YYYY-MM-DD'),
      })
      .subscribe(async res => {
        if(res.success){
          let data = res.data.map((d)=>{
            return {
              appointmentId: d.appointmentId,
              appointmentDate: d.appointmentDate,
              timeStart: d.timeStart,
              timeEnd: d.timeEnd,
              isWalkIn: d.isWalkIn,
              client: d.isWalkIn ? d.walkInAppointmentNotes : d.clientAppointment.client.fullName,
              vet: d.staff.fullName,
              vetUserId: d.staff.staffid,
              consultaionType: d.consultaionType.name,
              service: d.serviceType.name,
              amountToPay: d.serviceRate,
              isPaid: d.isPaid,
              appointmentStatus: d.appointmentStatus.name
            }
          });
          if(this.storageService.getLoginUser().role.roleId === RoleEnum.VET.toString()){
            const userTypeIdentityId = this.storageService.getLoginUser().userTypeIdentityId;
            data = data.filter(x=>x.vetUserId === userTypeIdentityId);
            this.dataSource.data = data;
          }
          else{
            this.dataSource.data = data;
          }
          this.dataSource.paginator = this.paginator;
          this.isLoading = false;
        }
        else{
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          this.isLoading = false;
        }
      }, async (err) => {
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        this.isLoading = false;
      });
    }
    catch(e){
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }

  }

  generateLoaderData(length: number){
    for (let i = 0; i < length; i++) {
      this.loaderData.push(i);
    }

  }

}
