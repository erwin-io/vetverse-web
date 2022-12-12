import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Client } from 'src/app/core/model/client.model';
import { Staff } from 'src/app/core/model/staff.model';
import { UserService } from 'src/app/core/services/user.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-select-people',
  templateUrl: './select-people.component.html',
  styleUrls: ['./select-people.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectPeopleComponent implements OnInit {
  typeId: number;
  vetFilter?: { serviceTypeFilter: string[] };
  searchKeyword: FormControl = new FormControl();

  conFirm = new EventEmitter();
  isLoading = false;
  error;
  list: {id: string, fullName: string}[];
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private userService: UserService,
    private snackBar: Snackbar,
    public dialogRef: MatDialogRef<SelectPeopleComponent>) {
      this.isLoading = true;
      dialogRef.disableClose = true;
    }

  ngOnInit(): void {
    if(this.typeId === 1) {
      this.showVets();
    } else if(this.typeId === 2){
      this.showClients();
    }else {
      this.dialogRef.close();
    }
  }

  async showVets(){
    try{
      this.isLoading = true;
      await this.userService.getStaffByAdvanceSearch({
        isAdvance: true,
        keyword: '',
        userId: '',
        email: '',
        mobileNumber: '',
        name: '',
        roles: 'Veterinarian'
      })
      .subscribe(async res => {
        if(res.success){
          this.list = res.data.length > 0 ? res.data.filter(x=>x.user.role.roleId === "3").map((v:Staff)=> {
            return { id: v.staffid, fullName: v.fullName}
          }): [];
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

  async showClients(){
    try{
      this.isLoading = true;
      await this.userService.getClientByAdvanceSearch({
        isAdvance: false,
        keyword: '',
        userId: '',
        email: '',
        mobileNumber: 0,
        name: ''
      })
      .subscribe(async res => {
        if(res.success){
          this.list = res.data.map((v:Client)=> {
            return { id: v.clientId, fullName: v.fullName}
          });
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

  onSelect(selected: { fullName: string }) {
    this.conFirm.emit(selected);
  }

  onDismiss(){
    this.dialogRef.close(false);
  }

}
