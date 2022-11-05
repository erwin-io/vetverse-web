import { Component, OnInit } from '@angular/core';
import { Client } from 'src/app/core/model/client.model';
import { UserService } from 'src/app/core/services/user.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-view-client-info',
  templateUrl: './view-client-info.component.html',
  styleUrls: ['./view-client-info.component.scss']
})
export class ViewClientInfoComponent implements OnInit {
  userId;
  clientData: Client;
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
          this.clientData = res.data;
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
