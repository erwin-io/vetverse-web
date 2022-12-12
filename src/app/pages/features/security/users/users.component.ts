import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Snackbar } from '../../../../../app/core/ui/snackbar';
import { UserService } from '../../../../../app/core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../../../../app/shared/alert-dialog/alert-dialog.component';
import { AlertDialogModel } from '../../../../../app/shared/alert-dialog/alert-dialog-model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Staff } from '../../../../../app/core/model/staff.model';
import { StorageService } from '../../../../../app/core/storage/storage.service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UsersComponent implements OnInit {

  currentUserId:string;
  error:string;
  userTypeId = 1;
  dataSource = new MatTableDataSource<any>();
  displayedColumns = [];
  isLoading = false;
  loaderData =[];
  isProcessing = false;
  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  pageSize = 10;


  isAdvanceSearch = false;
  isLoadingFilter = false;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  keywordCtrl = new FormControl('');
  userIdCtrl = new FormControl('');
  usernameCtrl = new FormControl('');
  emailCtrl = new FormControl('');
  mobileNumberCtrl = new FormControl('');
  nameCtrl = new FormControl('');
  filterSearchRolesCtrl = new FormControl('');

  filteredRoles: Observable<string[]>;
  selectedRoles: string[] = [];

  @ViewChild('filterSearchRolesInput') filterSearchRolesInput: ElementRef<HTMLInputElement>;

  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private userService: UserService,
    private snackBar: Snackbar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    public router: Router) {
      if (this.router.url.indexOf('staff') > -1) {
        this.userTypeId = 1;
      }
      else if(this.router.url.indexOf('clients') > -1){
        this.userTypeId = 2;
      }
      else{
        this.router.navigate(['/security/users/staff']);
      }
      this.initFilter();
      this.getUsers();}

  ngOnInit(): void {
    this.currentUserId = this.storageService.getLoginUser().userId;
    this.generateLoaderData(this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  get allRoles() {
    const _items = [];
    this.appconfig.config.lookup.roles.forEach((i: any) => {
      _items.push(i.name);
    });
    return _items;
  }

  initFilter(){
    this.selectedRoles = this.allRoles;
    this.filteredRoles = this.filterSearchRolesCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) => (value ? this.allRoles.filter(x=>x.toLowerCase().includes(value.toLowerCase())) : this.allRoles.slice())),
    );
  }

  remove(key: string, value: string): void {
    if(key === "roles") {
      const index = this.selectedRoles.indexOf(value);

      if (index >= 0) {
        this.selectedRoles.splice(index, 1);
      }
    }
  }

  selected(key: string ,event: MatAutocompleteSelectedEvent): void {
    if(key === "roles") {
      this.selectedRoles.push(event.option.viewValue);
      this.filterSearchRolesInput.nativeElement.value = '';
      this.filterSearchRolesCtrl.setValue(null);
    }
  }

  async getUsers(){
    try{
      if(this.userTypeId === 1) {
        this.displayedColumns = ['userId', 'username', 'fullName', 'role', 'email', 'mobileNumber', 'controls'];
        this.isLoading = true;
        await this.userService.getStaffByAdvanceSearch({
          isAdvance: this.isAdvanceSearch,
          keyword: this.keywordCtrl.value,
          userId: this.userIdCtrl.value,
          roles: this.selectedRoles.toString(),
          email: this.emailCtrl.value,
          mobileNumber: this.mobileNumberCtrl.value,
          name: this.nameCtrl.value,
        })
        .subscribe(async res => {
          if(res.success){
            let data = res.data.map((d)=>{
              return {
                userId: d.user.userId,
                username: d.user.username,
                fullName: d.fullName,
                role: d.user.role.name,
                email: d.email,
                mobileNumber: d.mobileNumber,
                enable: d.user.enable
              }
            });
            this.dataSource.data = data;
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
      }else{
        this.displayedColumns = ['userId', 'username', 'fullName', 'email', 'mobileNumber', 'controls'];
        this.isLoading = true;
        await this.userService.getClientByAdvanceSearch({
          isAdvance: this.isAdvanceSearch,
          keyword: this.keywordCtrl.value,
          userId: this.userIdCtrl.value,
          email: this.emailCtrl.value,
          mobileNumber: Number(this.mobileNumberCtrl.value),
          name: this.nameCtrl.value,
        })
        .subscribe(async res => {
          if(res.success){
            let data = res.data.map((d)=>{
              return {
                userId: d.user.userId,
                username: d.user.username,
                fullName: d.fullName,
                role: d.user.role.name,
                email: d.email,
                mobileNumber: d.mobileNumber,
                enable: d.user.enable
              }
            });
            this.dataSource.data = data;
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
    }
    catch(e){
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }

  }


  toggleEnable(userId:string, enable: boolean){
    const newValue = enable ? false : true;
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = newValue ? 'Enable user?' : 'Disable user?';
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
        this.userService.toggleEnable({ userId, enable: newValue})
          .subscribe(async res => {
            if (res.success) {
              this.getUsers();
              this.snackBar.snackbarSuccess(newValue ? 'User enabled!' : 'User disabled!');
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
