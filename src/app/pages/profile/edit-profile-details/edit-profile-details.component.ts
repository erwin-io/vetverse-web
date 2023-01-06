import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MyErrorStateMatcher } from 'src/app/core/form-validation/error-state.matcher';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { Staff } from 'src/app/core/model/staff.model';
import { UserService } from 'src/app/core/services/user.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit-profile-details',
  templateUrl: './edit-profile-details.component.html',
  styleUrls: ['./edit-profile-details.component.scss']
})
export class EditProfileDetailsComponent implements OnInit {

  currentUser:LoginResult;
  userData: Staff;
  userForm: FormGroup;
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isLoading = false;
  isProcessing = false;
  error;
  userProfilePic;
  //access
  //client;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private storageService: StorageService,
    private readonly changeDetectorRef: ChangeDetectorRef
    ) {
      this.currentUser = this.storageService.getLoginUser();
      this.userForm = this.formBuilder.group({
        firstName: ['', Validators.required],
        middleName: [],
        lastName: ['', Validators.required],
        genderId: ['', Validators.required],
        email: ['',
        Validators.compose(
            [Validators.email, Validators.required])],
        mobileNumber: ['',
            [Validators.minLength(11),Validators.maxLength(11), Validators.pattern("^[0-9]*$"), Validators.required]],
        address: ['', Validators.required],
      });
      this.initUser(this.currentUser.userId);
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }
  ngOnInit(): void {

  }

  async initUser(userId:string){
    this.isLoading = true;
    this.isProcessing = true;
    try{
      await this.userService.getById(userId)
      .subscribe(async res => {
        if (res.success) {
          this.userData = res.data;
          this.isLoading = false;
          this.isProcessing = false;
        } else {
          this.isLoading = false;
          this.isProcessing = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
          if(this.error.toLowerCase().includes("not found")){
            this.router.navigate(['/security/users/']);
          }
        }
      }, async (err) => {
        this.isLoading = false;
        this.isProcessing = false;
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
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
      if(this.error.toLowerCase().includes("not found")){
        this.router.navigate(['/security/users/']);
      }
    }
  }

  get f() { return this.userForm.controls; }
  get formIsValid() { return this.userForm.valid }
  get formData() {
    return {
      ...this.userForm.value,
      userId: this.userData.user.userId,
      roleId: this.currentUser.role.roleId,
      userProfilePic: this.userProfilePic,
    }
  }

  loadProfilePicture (event) {
    const image: any = document.getElementById("profilePicture");
    const file = event.target.files[0];
    console.log(file);
    image.src = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        this.userProfilePic = {
          fileName: file.name,
          data: reader.result.toString().split(',')[1]
        };
        console.log(this.formData);
    };
  };
  

  async onSubmit(){
    if (this.userForm.invalid) {
        return;
    }

    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Save changes?';
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
        const formData = this.formData;
        await this.userService.udpdateStaff(formData)
          .subscribe(async res => {
            if (res.success) {
              console.log(res.data);
              this.currentUser.fullName = res.data.fullName;
              this.currentUser.firtstName = res.data.firstName;
              this.currentUser.middleName = res.data.middleName;
              this.currentUser.lastName = res.data.lastName;
              this.currentUser.gender = res.data.gender;
              this.currentUser.mobileNumber = res.data.mobileNumber;
              this.currentUser.email = res.data.email;
              this.currentUser.address = res.data.address;
              this.currentUser.userProfilePic = res.data.user.userProfilePic.file.url;
              this.storageService.saveLoginUser(this.currentUser);
              this.snackBar.snackbarSuccess('Saved!');
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              dialogRef.close();
            } else {
              console.log(res);
              this.isProcessing = false;
              dialogRef.componentInstance.isProcessing = this.isProcessing;
              this.error = Array.isArray(res.message) ? res.message[0] : res.message;
              this.snackBar.snackbarError(this.error);
              dialogRef.close();
            }
          }, async (err) => {
            console.log(err);
            this.isProcessing = false;
            dialogRef.componentInstance.isProcessing = this.isProcessing;
            this.error = Array.isArray(err.message) ? err.message[0] : err.message;
            this.snackBar.snackbarError(this.error);
            dialogRef.close();
          });
      } catch (e){
        console.log(e);
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

  profilePicErrorHandler(event) {
    event.target.src = '../../../../assets/img/vector/profile-not-found.png';
  }
}
