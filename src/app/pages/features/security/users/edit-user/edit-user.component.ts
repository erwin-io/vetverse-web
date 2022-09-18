import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Snackbar } from '../../../../../../app/core/ui/snackbar';
import { MyErrorStateMatcher } from '../../../../../core/form-validation/error-state.matcher';
import { AlertDialogModel } from '../../../../../../app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from '../../../../../../app/shared/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../../../../app/core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../../../../../app/core/model/role.model';
import { RoleService } from '../../../../../../app/core/services/role.service';
import {COMMA, ENTER, N} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import { Staff } from '../../../../../../app/core/model/staff.model';
import { StorageService } from '../../../../../../app/core/storage/storage.service';
import { NavItem } from 'src/app/core/model/nav-item';
import { menu } from 'src/app/core/model/menu';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit, AfterViewChecked  {

  currentUserId:string;
  staffUser:Staff;
  staffUserRoleIds:string[] = [];
  userForm: FormGroup;
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isLoading = false;
  isProcessing = false;
  isLoadingRoles = false;
  //roles
  roles:Role[] = [];
  selectedRoles:string[] = [];
  error;
  //auto complete chips
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredRoles: Observable<string[]>;
  //end
  //access
  allowedAccess:string[] = [];

  @ViewChild('roleInput', {static:false}) roleInput: ElementRef<HTMLInputElement>;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private storageService: StorageService,
    private readonly changeDetectorRef: ChangeDetectorRef
    ) {
      this.currentUserId = this.storageService.getLoginUser().userId;
      const userId = this.route.snapshot.paramMap.get("userId");
      if(this.currentUserId === userId){
        this.snackBar.snackbarError("Invalid user, Cannot edit this user!");
        this.router.navigate(['/security/users/']);
      }
      this.userForm = this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9\\-\\s]+$")]],
        middleName: ['', Validators.pattern("^[a-zA-Z0-9\\-\\s]+$")],
        lastName: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9\\-\\s]+$")]],
        genderId: ['', Validators.required],
        email: ['',
        Validators.compose(
            [Validators.email, Validators.required])],
        mobileNumber: ['',
            [Validators.minLength(11),Validators.maxLength(11), Validators.pattern("^[0-9]*$"), Validators.required]],
        address: ['', Validators.required],
        roleId : ['', Validators.required],
      });
      this.initUser(userId);
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }
  ngOnInit(): void {

  }

  async initUser(userId:string){
    this.isLoading = true;
    this.isProcessing = true;
    this.isLoadingRoles = true;
    try{
      await this.userService.getById(userId)
      .subscribe(async res => {
        if (res.success) {
          this.staffUser = res.data;
          this.isLoading = false;
          this.isProcessing = false;
          this.initRoles();
        } else {
          this.isLoading = false;
          this.isProcessing = false;
          this.isLoadingRoles = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/security/users/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.isProcessing = false;
        this.isLoadingRoles = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
        if(this.error.toLowerCase().includes("not found")){
          this.router.navigate(['/security/users/']);
        }
      });
    }
    catch(e){
      this.isLoading = false;
      this.isProcessing = false;
      this.isLoadingRoles = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/security/users/']);
      }
    }
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

  get f() { return this.userForm.controls; }
  get formIsValid() { return this.userForm.valid }
  get formData() { return { ...this.userForm.value, userId: this.staffUser.user.userId }  }
  get accessToDisplay():NavItem[] {
    const access: NavItem[] = [];
    const selectedRole = this.roles.filter(x=>x.roleId === this.formData.roleId);
    const selectedAccess = selectedRole !== undefined && selectedRole[0] !== undefined && selectedRole[0].access ? selectedRole[0].access.split(",") : [];
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

  async onSubmit(){
    if (this.userForm.invalid) {
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

    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      this.isProcessing = true;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      try{
        this.isProcessing = true;
        const userData = this.formData;
        await this.userService.udpdateStaff(userData)
          .subscribe(async res => {
            if (res.success) {
              this.snackBar.snackbarSuccess('Saved!');
              this.router.navigate(['/security/users/details/' + res.data.user.userId]);
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
  getError(key:string){
    return this.f[key].errors;
  }
}
