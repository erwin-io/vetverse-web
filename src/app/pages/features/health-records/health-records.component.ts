import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Pet } from 'src/app/core/model/appointment.model';
import { PetService } from 'src/app/core/services/pet.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-health-records',
  templateUrl: './health-records.component.html',
  styleUrls: ['./health-records.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HealthRecordsComponent implements OnInit {

  error:string;
  dataSource = new MatTableDataSource<Pet>();
  data: Pet[] = [];
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;

  keywordCtrl = new FormControl('');

  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private petService: PetService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router) { }

  ngOnInit(): void {
    this.getPets();
    this.generateLoaderData(this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  // async add(){
  //   const dialogRef = this.dialog.open(ServiceTypeAddComponent, {
  //     closeOnNavigation: true,
  //     panelClass: 'service-type-dialog',
  //   });
  //   dialogRef.componentInstance.data = null;
  //   dialogRef.componentInstance.conFirm.subscribe((data: boolean) => {
  //     if(data){
  //       dialogRef.close();
  //       this.getServiceTypes();
  //     }
  //   });
  // }

  // async edit(serviceTypeId: string){

  //   const dialogRef = this.dialog.open(ServiceTypeAddComponent, {
  //     closeOnNavigation: true,
  //     panelClass: 'service-type-dialog',
  //   });
  //   dialogRef.componentInstance.data = { serviceTypeId };
  //   dialogRef.componentInstance.conFirm.subscribe((data: boolean) => {
  //     if(data){
  //       dialogRef.close();
  //       this.getServiceTypes();
  //     }
  //   });
  // }

  // async remove(serviceTypeId: string){
  //   const dialogData = new AlertDialogModel();
  //   dialogData.title = 'Confirm';
  //   dialogData.message = 'Delete service type?';
  //   dialogData.confirmButton = {
  //     visible: true,
  //     text: 'yes',
  //     color: 'primary',
  //   };
  //   dialogData.dismissButton = {
  //     visible: true,
  //     text: 'cancel',
  //   };
  //   const dialogRef = this.dialog.open(AlertDialogComponent, {
  //     maxWidth: '400px',
  //     closeOnNavigation: true,
  //   });

  //   dialogRef.componentInstance.alertDialogConfig = dialogData;
  //   dialogRef.componentInstance.conFirm.subscribe(async (confirm: any) => {
  //     if(confirm) {
  //       this.isProcessing = true;
  //       dialogRef.componentInstance.isProcessing = this.isProcessing;
  //       try {
  //         this.serviceTypeService
  //           .delete(serviceTypeId)
  //           .subscribe(
  //             async (res) => {
  //               if (res.success) {
  //                 this.getServiceTypes();
  //                 dialogRef.close();
  //                 this.isProcessing = false;
  //                 dialogRef.componentInstance.isProcessing = this.isProcessing;
  //               } else {
  //                 this.isProcessing = false;
  //                 dialogRef.componentInstance.isProcessing = this.isProcessing;
  //                 this.error = Array.isArray(res.message)
  //                   ? res.message[0]
  //                   : res.message;
  //                 this.snackBar.snackbarError(this.error);
  //               }
  //             },
  //             async (err) => {
  //               this.isProcessing = false;
  //               dialogRef.componentInstance.isProcessing = this.isProcessing;
  //               this.error = Array.isArray(err.message)
  //                 ? err.message[0]
  //                 : err.message;
  //               this.snackBar.snackbarError(this.error);
  //             }
  //           );
  //       } catch (e) {
  //         this.isProcessing = false;
  //         dialogRef.componentInstance.isProcessing = this.isProcessing;
  //         this.error = Array.isArray(e.message) ? e.message[0] : e.message;
  //         this.snackBar.snackbarError(this.error);
  //       }
  //     }
  //   });
  // }

  // filter() {
  //   this.isLoading = true;
  //   const keyword = this.keywordCtrl.value.toLowerCase();
  //   this.dataSource.data = this.data.length > 0 ?
  //   this.data.filter(x=>x.serviceTypeId.toLowerCase().includes(keyword) ||
  //   x.name.toLowerCase().includes(keyword) ||
  //   (x.description ? x.description.toLowerCase().includes(keyword) : false) ||
  //   x.price.toString().toLowerCase().includes(keyword) ||
  //   x.durationInHours.toLowerCase().includes(keyword)) : [];
  //   this.dataSource.paginator = this.paginator;
  //   this.isLoading = false;
  // }

  view(petId: string) {

  }

  getPets(){
    this.displayedColumns = ['petId', 'name', 'category', 'owner', 'email' , 'mobileNumber', 'controls'];
    try{
      this.isLoading = true;
      this.petService.get()
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
