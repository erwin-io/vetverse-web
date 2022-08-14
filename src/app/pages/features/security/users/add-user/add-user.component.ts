import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Snackbar } from '../../../../../../app/core/ui/snackbar';
import { MyErrorStateMatcher } from '../../../../../core/form-validation/error-state.matcher';
import { AlertDialogModel } from '../../../../../../app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from '../../../../../../app/shared/alert-dialog/alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../../../../app/core/services/user.service';
import { Router } from '@angular/router';
import { Role } from '../../../../../../app/core/model/role.model';
import { RoleService } from '../../../../../../app/core/services/role.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import { NavItem } from '../../../ui/model/nav-item';
import { menu } from '../../../ui/model/menu';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  userForm: FormGroup;
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
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
    private dialog: MatDialog,
    private snackBar: Snackbar) {
      this.userForm = this.formBuilder.group({
        firstName: ['', [Validators.required]],
        middleName: [''],
        lastName: ['', [Validators.required]],
        birthDate: ['', Validators.required],
        genderId: ['', Validators.required],
        email: ['',
        Validators.compose(
            [Validators.email, Validators.required])],
        mobileNumber: ['',
            [Validators.minLength(11),Validators.maxLength(11), Validators.pattern("^[0-9]*$"), Validators.required]],
        address: ['', Validators.required],
        username: ['', [Validators.required, Validators.minLength(3), Validators.pattern("^[a-z0-9_]*$")]],
        password: ['',[Validators.minLength(6), Validators.maxLength(16), Validators.required]],
        confirmPassword : '',
        roleIds : '',
      }, { validators: this.checkPasswords });
      this.filteredRoles = this.userForm.controls['roleIds'].valueChanges.pipe(
        startWith(null),
        map((role: string | null) => (role ? this._filter(role) : this.roleArray.slice())),
      );
    }

  ngOnInit(): void {
    this.initRoles();
  }
  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : {notMatched:true} ;
  };

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
  get formIsValid() { return this.userForm.valid && this.selectedRoles.length > 0; }
  // get formData() { return this.userForm.value }
  get formData() {
    return {
      ...this.userForm.value,
      roleIds: this.staffRoleIds.toString()
    }
   }
   get staffRoleIds() {
     return this.roles.length > 0 ? this.roles.filter((r)=> this.selectedRoles.some(x=>x === r.name) ).map(r=>{ return r.roleId }) : [] }
  get roleArray() { return this.roles.map((r)=> { return r.name }) }

  get accessToDisplay():NavItem[] {
    const access: NavItem[] = [];
    const selectedAccess = [];
    this.roles.forEach(r=>{
      if(this.selectedRoles.some(x=> x === r.name)){
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

  onSubmit(){
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

    dialogRef.componentInstance.conFirm.subscribe((data: any) => {
      this.isProcessing = true;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      try{
        this.isProcessing = true;
        this.userService.createStaff(this.formData)
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
    if(key === "confirmPassword"){
      this.formData.confirmPassword !== this.formData.password ? this.f[key].setErrors({notMatched:true}) : this.f[key].setErrors(null);
    }
    return this.f[key].errors;
  }

  removeRole(role: string): void {
    const index = this.selectedRoles.indexOf(role);

    if (index >= 0) {
      this.selectedRoles.splice(index, 1);
    }
  }

  selectedRole(event: MatAutocompleteSelectedEvent): void {
    this.selectedRoles.push(event.option.viewValue);
    this.roleInput.nativeElement.value = '';
    this.f['roleIds'].setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.roleArray.filter((r) => r.toLowerCase().includes(filterValue));
  }
}
