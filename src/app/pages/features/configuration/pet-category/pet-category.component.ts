import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Snackbar } from '../../../../../app/core/ui/snackbar';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PetCategory, PetType, ServiceType } from 'src/app/core/model/appointment.model';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { FormControl } from '@angular/forms';
import { PetCategoryService } from 'src/app/core/services/pet-category.service';
import { PetCategoryAddComponent } from './pet-category-add/pet-category-add.component';

@Component({
  selector: 'app-pet-category',
  templateUrl: './pet-category.component.html',
  styleUrls: ['./pet-category.component.scss']
})
export class PetCategoryComponent implements OnInit {

  error:string;
  dataSource = new MatTableDataSource<PetCategory>();
  data: PetCategory[] = [];
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;

  keywordCtrl = new FormControl('');

  constructor(
    private petCategoryService: PetCategoryService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router) { }

  ngOnInit(): void {
    this.getPetCategory();
    this.generateLoaderData(this.pageSize);
  }

  async add(){
    const dialogRef = this.dialog.open(PetCategoryAddComponent, {
      closeOnNavigation: true,
      panelClass: 'pet-category-dialog',
    });
    dialogRef.componentInstance.data = null;
    dialogRef.componentInstance.conFirm.subscribe((data: boolean) => {
      if(data){
        dialogRef.close();
        this.getPetCategory();
      }
    });
  }

  async edit(petCategoryId: string){

    const dialogRef = this.dialog.open(PetCategoryAddComponent, {
      closeOnNavigation: true,
      panelClass: 'pet-category-dialog',
    });
    dialogRef.componentInstance.data = { petCategoryId };
    dialogRef.componentInstance.conFirm.subscribe((data: boolean) => {
      if(data){
        dialogRef.close();
        this.getPetCategory();
      }
    });
  }

  async remove(petCategoryId: string){
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Delete pet category?';
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
          this.petCategoryService
            .delete(petCategoryId)
            .subscribe(
              async (res) => {
                if (res.success) {
                  this.getPetCategory();
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
    this.data.filter(x=>x.petCategoryId.toLowerCase().includes(keyword) ||
    x.name.toLowerCase().includes(keyword) ||
    x.petType.name.toLowerCase().includes(keyword)) : [];
    this.dataSource.paginator = this.paginator;
    this.isLoading = false;
  }

  getPetCategory(){
    this.displayedColumns = ['petCategoryId', 'name', 'petType', 'controls'];
    try{
      this.isLoading = true;
      this.petCategoryService.get()
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

