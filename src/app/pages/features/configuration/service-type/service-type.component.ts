import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Snackbar } from '../../../../../app/core/ui/snackbar';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ServiceType } from 'src/app/core/model/appointment.model';
import { ServiceTypeService } from 'src/app/core/services/service-type.service';
import { ServiceTypeAddComponent } from './service-type-add/service-type-add.component';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-service-type',
  templateUrl: './service-type.component.html',
  styleUrls: ['./service-type.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServiceTypeComponent implements OnInit {
  error:string;
  dataSource = new MatTableDataSource<ServiceType>();
  data: ServiceType[] = [];
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;

  keywordCtrl = new FormControl('');

  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private serviceTypeService: ServiceTypeService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router) { }

  ngOnInit(): void {
    this.getServiceTypes();
    this.generateLoaderData(this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async add(){
    const dialogRef = this.dialog.open(ServiceTypeAddComponent, {
      closeOnNavigation: true,
      panelClass: 'service-type-dialog',
    });
    dialogRef.componentInstance.data = null;
    dialogRef.componentInstance.conFirm.subscribe((data: boolean) => {
      if(data){
        dialogRef.close();
        this.getServiceTypes();
      }
    });
  }

  async edit(serviceTypeId: string){

    const dialogRef = this.dialog.open(ServiceTypeAddComponent, {
      closeOnNavigation: true,
      panelClass: 'service-type-dialog',
    });
    dialogRef.componentInstance.data = { serviceTypeId };
    dialogRef.componentInstance.conFirm.subscribe((data: boolean) => {
      if(data){
        dialogRef.close();
        this.getServiceTypes();
      }
    });
  }

  async remove(serviceTypeId: string){
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Delete service type?';
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
          this.serviceTypeService
            .delete(serviceTypeId)
            .subscribe(
              async (res) => {
                if (res.success) {
                  this.getServiceTypes();
                  dialogRef.close();
                  this.isProcessing = false;
                  dialogRef.componentInstance.isProcessing = this.isProcessing;
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

  filter() {
    this.isLoading = true;
    const keyword = this.keywordCtrl.value.toLowerCase();
    this.dataSource.data = this.data.length > 0 ?
    this.data.filter(x=>x.serviceTypeId.toLowerCase().includes(keyword) ||
    x.name.toLowerCase().includes(keyword) ||
    (x.description ? x.description.toLowerCase().includes(keyword) : false) ||
    x.price.toString().toLowerCase().includes(keyword) ||
    x.durationInHours.toLowerCase().includes(keyword)) : [];
    this.dataSource.paginator = this.paginator;
    this.isLoading = false;
  }

  getServiceTypes(){
    this.displayedColumns = ['serviceTypeId', 'name', 'price', 'durationInHours', 'isMedicalServiceType', 'controls'];
    try{
      this.isLoading = true;
      this.serviceTypeService.get()
      .subscribe(async res => {
        if(res.success){
          this.data = res.data;
          this.dataSource.data = this.data;
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
