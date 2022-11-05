import { Component, OnInit } from '@angular/core';
import { Staff } from 'src/app/core/model/staff.model';
import { UserService } from 'src/app/core/services/user.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-view-veterinarian-info',
  templateUrl: './view-veterinarian-info.component.html',
  styleUrls: ['./view-veterinarian-info.component.scss']
})
export class ViewVeterinarianInfoComponent implements OnInit {
  userId;
  staffData: Staff;
  isLoading = false;
  error;
  constructor(
    private userService: UserService,
    private snackBar: Snackbar) { }

  ngOnInit(): void {
    this.initUser(this.userId);
  }

  get hasError() {
    return this.error && this.error !== undefined;
  }

  async initUser(userId:string){
    this.error = false;
    this.isLoading = true;
    try{
      await this.userService.getById(userId)
      .subscribe(async res => {
        if (res.success) {
          this.staffData = res.data;
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.snackbarError(this.error);
        }
      }, async (err) => {
        this.isLoading = false;
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.snackbarError(this.error);
      });
    }
    catch(e){
      this.isLoading = false;
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.snackbarError(this.error);
    }
  }
}
