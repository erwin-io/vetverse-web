import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../../../../app/core/model/role.model';
import { RoleService } from '../../../../../app/core/services/role.service';
import { Snackbar } from '../../../../../app/core/ui/snackbar';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../../../app/shared/alert-dialog/alert-dialog.component';
import { AlertDialogModel } from '../../../../../app/shared/alert-dialog/alert-dialog-model';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  error:string;
  userTypeId:string = '1';
  dataSource:Role[] = [];
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  constructor(
    private roleService: RoleService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router) { }

  ngOnInit(): void {
    this.generateLoaderData(10);
    this.getRoles();
  }

  getRoles(){
    this.displayedColumns = ['roleId', 'name', 'access', 'controls'];
    try{
      this.isLoading = true;
      this.roleService.get()
      .subscribe(async res => {
        if(res.success){
          this.dataSource = res.data;
          console.log(res.data);
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

  onDelete(roleId:string){
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Delete role?';
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color:'primary'
    }
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel'
    }
    const dialogRef = this.dialog.open(AlertDialogComponent, {
        maxWidth: '400px',
        closeOnNavigation: true
    })
    dialogRef.componentInstance.alertDialogConfig = dialogData;

    try{

      dialogRef.componentInstance.conFirm.subscribe((data: any) => {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        dialogRef.componentInstance.alertDialogConfig.message = 'Deleting please wait...';
        this.roleService.delete(roleId)
          .subscribe(async res => {
            if (res.success) {
              this.snackBar.snackbarSuccess('Deleted!');
              this.getRoles();
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              dialogRef.close();
            } else {
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              this.error = Array.isArray(res.message) ? res.message[0] : res.message;
              this.snackBar.snackbarError(this.error);
              dialogRef.close();
            }
          }, async (err) => {
            this.isProcessing = false;
            dialogRef.componentInstance.isProcessing = this.isProcessing;
            this.error = Array.isArray(err.message) ? err.message[0] : err.message;
            this.snackBar.snackbarError(this.error);
            dialogRef.close();
          });
    });
    } catch (e){
      this.isProcessing = false;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      dialogRef.close();
    }
  }

  generateLoaderData(length: number){
    for (let i = 0; i < length; i++) {
      this.loaderData.push(i);
    }

  }
}
