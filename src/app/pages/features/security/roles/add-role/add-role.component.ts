import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Snackbar } from '../../../../../../app/core/ui/snackbar';
import { StorageService } from '../../../../../../app/core/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../../../../app/core/services/role.service';
import { MatDialog } from '@angular/material/dialog';
import { menu } from '../../../ui/model/menu';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AlertDialogComponent } from '../../../../../../app/shared/alert-dialog/alert-dialog.component';
import { AlertDialogModel } from '../../../../../../app/shared/alert-dialog/alert-dialog-model';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {

  roleForm: FormGroup;
  loading = false;
  error: string;
  isProcessing = false;
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
    this.roleForm = this.formBuilder.group({
        name: ['', Validators.required],
    });
    this.displayedColumns = ['enabled', 'module', 'page'];
    this.initMenuTable();
  }
  ngAfterViewInit(): void {
      this.menuTableSource.paginator = this.paginator;
  }
  onModuleChange(event){
    this.menuTableSource = new MatTableDataSource<any>([]);
    const selectedModule:any = menu.filter(x=>x.displayName === event.value)[0];
    if(selectedModule.isParent){
      this.menuTableSource = new MatTableDataSource(
        selectedModule.children.map((m)=>{
        m.enabled = this.selectedPage.some(x=> x === m.displayName);
        return m;
      }));
    }
    else{
      selectedModule.enabled = this.selectedPage.some(x=> x === selectedModule.displayName);
      this.menuTableSource = new MatTableDataSource([selectedModule]);
    }
    this.menuTableSource.paginator = this.paginator;
  }

  initMenuTable(){
    this.menuTableSource = new MatTableDataSource<any>([]);
    const menuTable = [];
    menu.forEach(m => {
      if(m.isParent && m.children !== undefined && m.children.length > 0){
        const pages = m.children.map((c)=>{
          return { module: m.displayName, page: c.displayName, enable: false }
        })
        pages.forEach(p=>{menuTable.push(p);})

      }else{
        menuTable.push({ module: m.displayName, page: m.displayName, enable: false });
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

  get f() { return this.roleForm.controls; }
  get formData() { return this.roleForm.value; }

  onSubmit(){
    if (this.roleForm.invalid) {
        return;
    }

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

    dialogRef.componentInstance.conFirm.subscribe((data: any) => {
      this.isProcessing = true;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      this.formData.access = this.selectedPage.toString();
      try{
        this.isProcessing = true;
        this.roleService.create(this.formData)
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

  saveRole(){
  }

  getError(key:string){
    return this.f[key].errors;
  }

}
