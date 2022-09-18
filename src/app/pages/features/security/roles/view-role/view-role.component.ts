import { Component, OnInit } from '@angular/core';
import { Role } from '../../../../../core/model/role.model';
import { RoleService } from '../../../../../../app/core/services/role.service';
import { Snackbar } from '../../../../../../app/core/ui/snackbar';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertDialogModel } from '../../../../../../app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from '../../../../../../app/shared/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NavItem } from 'src/app/core/model/nav-item';
import { menu } from 'src/app/core/model/menu';

@Component({
  selector: 'app-view-role',
  templateUrl: './view-role.component.html',
  styleUrls: ['./view-role.component.scss']
})
export class ViewRoleComponent implements OnInit {

  error:string;
  role:Role = new Role();
  pageAccess: NavItem[] = [];
  isLoading = false;
  isProcessing = false;
  constructor(private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: Snackbar) {
    }

  ngOnInit(): void {
    const roleId = this.route.snapshot.paramMap.get("roleId");
    this.getRole(roleId);
  }

  async getRole(roleId:string){
    this.isLoading = true;
    try{
      await this.roleService.getById(roleId)
      .subscribe(async res => {
        if(res.success){
          this.role = res.data;
          console.log(this.role);
          console.log(this.role.access);
          const access = this.role.access ? this.role.access.split(",") : [];
          this.initPageAccess(access);
          this.isLoading = false;
        }
        else{
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          this.router.navigate(['/security/roles/']);
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        this.router.navigate(['/security/roles/']);
      });
    }catch (e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      this.router.navigate(['/security/roles/']);
    }
  }

  async initPageAccess(access:string[]){
    this.pageAccess = [];
    menu.forEach(m => {
      if(m.isParent && m.children.length > 0){
        m.children.forEach(p=>{
          if(access.some(x=>x === p.displayName)){
            this.pageAccess.push(p);
          }
        })

      }else if(!m.isParent && access.some(x=>x === m.displayName)) {
        this.pageAccess.push(m);
      }
    });
  }


}
