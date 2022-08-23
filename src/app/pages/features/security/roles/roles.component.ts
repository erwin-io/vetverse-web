import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../../../../../app/core/model/role.model';
import { RoleService } from '../../../../../app/core/services/role.service';
import { Snackbar } from '../../../../../app/core/ui/snackbar';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../../../app/shared/alert-dialog/alert-dialog.component';
import { AlertDialogModel } from '../../../../../app/shared/alert-dialog/alert-dialog-model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  error:string;
  userTypeId:string = '1';
  dataSource = new MatTableDataSource<Role>();
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 5;

  constructor(
    private roleService: RoleService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    public router: Router) { }

  ngOnInit(): void {
    this.getRoles();
    this.generateLoaderData(this.pageSize);
  }

  getRoles(){
    this.displayedColumns = ['name', 'access', 'controls'];
    try{
      this.isLoading = true;
      this.roleService.get()
      .subscribe(async res => {
        if(res.success){
          this.dataSource.data = res.data;
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
