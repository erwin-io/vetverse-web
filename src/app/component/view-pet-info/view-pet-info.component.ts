import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Pet } from 'src/app/core/model/appointment.model';
import { PetService } from 'src/app/core/services/pet.service';
import { Snackbar } from 'src/app/core/ui/snackbar';

@Component({
  selector: 'app-view-pet-info',
  templateUrl: './view-pet-info.component.html',
  styleUrls: ['./view-pet-info.component.scss']
})
export class ViewPetInfoComponent implements OnInit {
  petId;
  petData: Pet;
  isLoading = false;
  error;
  constructor(
    private petService: PetService,
    private dialog: MatDialog,
    private snackBar: Snackbar) { }

  ngOnInit(): void {
    this.initPet(this.petId);
  }

  get hasError() {
    return this.error && this.error !== undefined;
  }

  async initPet(userId:string) {
    this.error = false;
    this.isLoading = true;
    try{
      await this.petService.getById(userId)
      .subscribe(async res => {
        if (res.success) {
          this.petData = res.data;
          console.log(res.data);
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
