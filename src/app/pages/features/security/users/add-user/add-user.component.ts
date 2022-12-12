import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import {COMMA, ENTER, P} from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {map, startWith} from 'rxjs/operators';
import { NavItem } from 'src/app/core/model/nav-item';
import { menu } from 'src/app/core/model/menu';
import { AuthService } from 'src/app/core/services/auth.service';
import { Pet } from 'src/app/core/model/appointment.model';
import { MatTableDataSource } from '@angular/material/table';
import { AddPetComponent } from 'src/app/component/add-pet/add-pet.component';
import * as moment from 'moment';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddUserComponent implements OnInit {
  userTypeId = 1;
  userForm: FormGroup;
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isProcessing = false;
  isLoadingRoles = false;
  //roles
  roles:Role[] = [];
  error;
  //pets
  displayedPetsColumns: string[] = [];
  petsDataSource = new MatTableDataSource<Pet>();
  petsAdded: Pet[] = [];
  @ViewChild('roleInput', {static:false}) roleInput: ElementRef<HTMLInputElement>;
  maxDate = moment(new Date().getFullYear() - 18).format("YYYY-MM-DD");

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: Snackbar) {
      console.log(this.maxDate);
      if (this.router.url.indexOf('staff') > -1) {
        this.userTypeId = 1;
      }
      else if(this.router.url.indexOf('clients') > -1){
        this.userTypeId = 2;
      }
      else{
        this.router.navigate(['/security/users/']);
      }
      if(this.userTypeId === 1){
        this.userForm = this.formBuilder.group({
          firstName: ['', Validators.required],
          middleName: [''],
          lastName: ['', Validators.required],
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
          roleId : ['', Validators.required],
        }, { validators: this.checkPasswords });
      }
      else{
        this.userForm = this.formBuilder.group({
          firstName: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9\\-\\s]+$")]],
          middleName: ['', Validators.pattern("^[a-zA-Z0-9\\-\\s]+$")],
          lastName: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9\\-\\s]+$")]],
          genderId: ['', Validators.required],
          birthDate: ['', Validators.required],
          email: ['',
          Validators.compose(
              [Validators.email, Validators.required])],
          mobileNumber: ['',
              [Validators.minLength(11),Validators.maxLength(11), Validators.pattern("^[0-9]*$"), Validators.required]],
          address: ['', Validators.required],
          username: ['', [Validators.required, Validators.minLength(3), Validators.pattern("^[a-z0-9_]*$")]],
          password: ['',[Validators.minLength(6), Validators.maxLength(16), Validators.required]],
          confirmPassword : '',
        }, { validators: this.checkPasswords });
      }
    }

  ngOnInit(): void {
    if(this.userTypeId === 1){
      this.initRoles();
    }else{
      this.petsDataSource.data = [];
    }
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
  get formIsValid() { return this.userForm.valid }
  get formData() {
    return this.userTypeId === 1 ? this.userForm.value : {
      ...this.userForm.value,
      pets: this.petsAdded.map((p:Pet) =>{
        return {
          petCategoryId: p.petCategory.petCategoryId,
          name: p.name,
          birthDate: p.birthDate,
          weight: p.weight,
          genderId: p.gender.genderId
      }})
    }
  }

  get accessToDisplay():NavItem[] {
    if(this.userTypeId !== 1) return [];
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

  onSubmit(){
    if (this.userForm.invalid) {
        return;
    }
    const params = this.formData;
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Save user?';
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
        if(this.userTypeId === 1){
          this.userService.createStaff(params)
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
        }else {
          this.userService.createClient(params)
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
        }
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

  async addPet(){
    const dialogRef = this.dialog.open(AddPetComponent, {
      closeOnNavigation: true,
      panelClass: 'add-pet-dialog',
    });
    dialogRef.componentInstance.fromNewClient = true;
    dialogRef.componentInstance.conFirm.subscribe((data: Pet) => {
      if(data){
        console.log(data);
        const pet = new Pet();
        pet.petId = (this.petsAdded.length + 1).toString();
        pet.name = data.name;
        pet.birthDate = data.birthDate;
        pet.weight = data.weight;
        pet.petCategory = data.petCategory;
        pet.gender = data.gender;
        this.petsAdded.push(pet);
        this.displayAddedPet();
        dialogRef.close();
      }
    });
  }

  async editPet(pet: Pet){
    const dialogRef = this.dialog.open(AddPetComponent, {
      closeOnNavigation: true,
      panelClass: 'add-pet-dialog',
    });
    dialogRef.componentInstance.data = pet;
    dialogRef.componentInstance.fromNewClient = true;
    dialogRef.componentInstance.conFirm.subscribe((data: Pet) => {
      if(data){
        console.log(data);
        const pet = new Pet();
        pet.petId = (this.petsAdded.length + 1).toString();
        pet.name = data.name;
        pet.birthDate = data.birthDate;
        pet.weight = data.weight;
        pet.petCategory = data.petCategory;
        pet.gender = data.gender;

        const index = this.petsAdded.findIndex((x => x.petId === data.petId));
        this.petsAdded[index] = pet;
        console.log(this.petsAdded.filter(x=>x.petId === data.petId)[0]);
        this.displayAddedPet();
        dialogRef.close();
      }
    });
  }

  async removePet(petId: string){
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Remove pet?';
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
    dialogRef.componentInstance.conFirm.subscribe(async (confirmed: any) => {
      if (confirmed) {
        this.isProcessing = true;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        try {
          const index = this.petsAdded.findIndex(x=>x.petId === petId);
          this.petsAdded.splice(index,1);
          this.displayAddedPet();
          dialogRef.close();
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
        } catch (e) {
          this.error = Array.isArray(e.message) ? e.message[0] : e.message;
          this.snackBar.snackbarError(this.error);
          dialogRef.componentInstance.isProcessing = this.isProcessing;
        }
      }
    });
  }

  async displayAddedPet(){
    this.displayedPetsColumns = ["name", "petCategory", "birthDate", "weight", "gender", "controls"]
    this.petsDataSource.data = this.petsAdded;
  }
}
