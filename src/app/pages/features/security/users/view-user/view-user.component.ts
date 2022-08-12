import { Component, OnInit } from '@angular/core';
import { NavItem } from '../../../ui/model/nav-item';
import { menu } from '../../..//ui/model/menu';
import { Role } from 'src/app/core/model/role.model';
import { Subscription } from 'rxjs';
import { RoleService } from '../../../../../../app/core/services/role.service';
import { AlertDialogModel } from '../../../../../../app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from '../../../../../../app/shared/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../../../../app/core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Snackbar } from '../../../../../../app/core/ui/snackbar';
import { Staff } from '../../../../../../app/core/model/staff.model';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss']
})
export class ViewUserComponent implements OnInit {

  staffUser:Staff;
  mediaWatcher: Subscription;
  isLoading = false;
  isProcessing = false;
  isLoadingRoles = false;
  //roles
  roles:Role[] = [];
  selectedRoles:string[] = [];
  error;
  //access
  allowedAccess:string[] = [];
  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: Snackbar) {
      this.initRoles();
     }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get("userId");
    this.initUser(userId);
  }

  initRoles(){
    try{
      this.isLoadingRoles = true;
      this.roleService.get()
      .subscribe(async res => {
        if (res.success) {
          this.roles = res.data;
          this.isLoadingRoles = false;
        } else {
          this.isLoadingRoles = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
        }
      }, async (err) => {
        this.isLoadingRoles = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
      });
    }catch(e){
      this.isLoadingRoles = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  async initUser(userId:string){
    this.isLoading = true;
    try{
      await this.userService.getById(userId)
      .subscribe(async res => {
        if (res.success) {
          this.staffUser = res.data;
          this.selectedRoles = this.staffUser.user.roleIds.split(",");
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/security/users/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/security/users/']);
        }
      });
    }
    catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/security/users/']);
      }
    }
  }

  get rolesToDisplay():string[] {
    const roles = [];
    this.roles.forEach(r=>{
      if(this.selectedRoles.some(x=> x === r.roleId)){
        roles.push(r.name);
      }
    });
    return roles;
  }

  get accessToDisplay():NavItem[] {
    const access: NavItem[] = [];
    const selectedAccess = [];
    this.roles.forEach(r=>{
      if(this.selectedRoles.some(x=> x === r.roleId)){
        const roleAccess = r.access.split(",");
        roleAccess.forEach(ra => { selectedAccess.push(ra); });
      }
    });
    if(selectedAccess.length === 0) {return []};
    menu.forEach(element => {
      if(element.isParent && element.children.length > 0) {
        element.children.forEach(c=>{
          if(selectedAccess.some(a=>a===c.displayName)){
            access.push(c);
          }
        })
      }
      else if(selectedAccess.some(x=> !element.isParent && x === element.displayName)){
        access.push(element);
      }
    });
    return access;
  }

  toggleEnable(userId:string){
    const enable = this.staffUser.user.enable ? false : true;
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = enable ? 'Enable user?' : 'Disable user?';
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
        dialogRef.componentInstance.alertDialogConfig.message = 'Please wait...';
        this.userService.toggleEnable({ userId, enable})
          .subscribe(async res => {
            if (res.success) {
              this.staffUser = res.data;
              this.snackBar.snackbarSuccess(enable ? 'User enabled!' : 'User disabled!');
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

}
