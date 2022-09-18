import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Snackbar } from '../../../../../../app/core/ui/snackbar';
import { StorageService } from '../../../../../../app/core/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../../../../app/core/services/role.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AlertDialogComponent } from '../../../../../../app/shared/alert-dialog/alert-dialog.component';
import { AlertDialogModel } from '../../../../../../app/shared/alert-dialog/alert-dialog-model';
import { Role } from '../../../../../../app/core/model/role.model';
import { menu } from 'src/app/core/model/menu';

@Component({
  selector: 'app-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent implements OnInit {

  role:Role = new Role();
  loading = false;
  error: string;
  isProcessing = false;
  isLoading = false;
  menuModule = [];
  public menuTableSource = new MatTableDataSource<any>([]);  // <-- STEP (1)
  displayedColumns = [];
  selectedPage = [];
  @ViewChild('paginator') private paginator: MatPaginator;  // <-- STEP (3)
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private roleService: RoleService,
    private storageService: StorageService,
    private snackBar: Snackbar) { }

  ngOnInit(): void {
    this.displayedColumns = ['enabled', 'module', 'page'];
    const roleId = this.route.snapshot.paramMap.get("roleId");;

    this.getRole(roleId);
  }
  ngAfterViewInit(): void {
      this.menuTableSource.paginator = this.paginator;
  }

  async getRole(roleId:string){
    this.isLoading = true;
    try{
      await this.roleService.getById(roleId)
      .subscribe(async res => {
        if(res.success){
          this.role = res.data;
          this.selectedPage = this.role.access ? this.role.access.split(",") : [];

          this.initMenuTable()
          this.isLoading = false;
        }
        else{
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/security/roles/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/security/roles/']);
        }
      });
    }catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/security/roles/']);
      }
    }
  }

  initMenuTable(){
    this.menuTableSource = new MatTableDataSource<any>([]);
    const menuTable = [];
    menu.forEach(m => {
      if(m.isParent && m.children !== undefined && m.children.length > 0){
        const pages = m.children.map((c)=>{
          return { module: m.displayName, page: c.displayName, enable: this.selectedPage.some(x=>x === c.displayName) }
        })
        pages.forEach(p=>{menuTable.push(p);})

      }else{
        menuTable.push({ module: m.displayName, page: m.displayName, enable: this.selectedPage.some(x=>x === m.displayName)  });
      }
    });

    this.menuTableSource = new MatTableDataSource(menuTable);
  }

  enable(checked, pageName){
    if(checked && !this.selectedPage.some(x=> x === pageName)){
      this.selectedPage.push(pageName);
    }
    else if(!checked && this.selectedPage.some(x=> x === pageName)){
      const index = this.selectedPage.indexOf(pageName, 0);
      if (index > -1) {
        this.selectedPage.splice(index, 1);
      }
    }
  }

  get formData() { return { roleId: this.role.roleId, access: this.selectedPage.toString() }}

  onSubmit(){

    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Save role?';
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

    dialogRef.componentInstance.conFirm.subscribe(() => {
      this.isProcessing = true;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      try{
        this.isProcessing = true;
        this.roleService.udpdate(this.formData)
          .subscribe(async res => {
            if (res.success) {
              this.snackBar.snackbarSuccess('Saved!');
              this.router.navigate(['/security/roles/details/' + res.data.roleId]);
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
      } catch (e){
        this.isProcessing = false;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        this.error = Array.isArray(e.message) ? e.message[0] : e.message;
        this.snackBar.snackbarError(this.error);
        dialogRef.close();
      }
    });
  }
  isEnable(page:string){
    return this.selectedPage.some(x=>x === page);
  }

}

