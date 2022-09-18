import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, startWith, map } from 'rxjs';
import { Pet, PetCategory, PetType, ServiceType } from 'src/app/core/model/appointment.model';
import { Gender } from 'src/app/core/model/gender.model';
import { AppConfigService } from 'src/app/core/services/app-config.service';
import { PetCategoryService } from 'src/app/core/services/pet-category.service';
import { PetTypeService } from 'src/app/core/services/pet-type.service';
import { Snackbar } from 'src/app/core/ui/snackbar';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-add-pet',
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddPetComponent implements OnInit {

  data: Pet = new Pet();
  petForm: FormGroup;
  conFirm = new EventEmitter();
  isProcessing = false;
  isLoading = false;
  isLoadingLookup = false;
  error;
  // petCategoryFilterArg: { petTypeId: string } = { petTypeId: ''};
  petTypeLookup: PetType[]=[];
  petCategoryLookup: PetCategory[]=[];
  genderLookup: Gender[]=[{ genderId: "1", name: "Male" },{ genderId: "2", name: "Female" }];
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private petTypeService: PetTypeService,
    private petCategoryService: PetCategoryService,
    private appconfig: AppConfigService,
    public dialogRef: MatDialogRef<AddPetComponent>
  ) {
    this.petForm = this.formBuilder.group({
      name: ['', Validators.required],
      petType: [null, Validators.required],
      petCategory: [null, Validators.required],
      birthDate: ['', Validators.required],
      weight: ['', Validators.required],
      gender: [null, Validators.required],
    });
    this.initLookup();
    dialogRef.disableClose = true;

  }
  ngOnInit(): void {
    if(!this.isNew) {

    }
  }

  ngAfterViewInit(): void {
  }

  initLookup(){
    this.isProcessing = true;
    forkJoin(
      this.petTypeService.get(),
      this.petCategoryService.get(),
  ).subscribe(
      ([getPetTypeService, getPetCategoryService]) => {
          // do things
          this.petTypeLookup = getPetTypeService.data;
          this.petCategoryLookup = getPetCategoryService.data;
      },
      (error) => console.error(error),
      () => {
        if(!this.isNew){
          this.f['name'].setValue(this.data.name);
          this.f['birthDate'].setValue(this.data.birthDate);
          this.f['weight'].setValue(this.data.weight);
          this.f['petType'].setValue(this.petTypeLookup.filter(x=>x.petTypeId === this.data.petCategory.petType.petTypeId)[0]);
          this.f['petCategory'].setValue(this.petCategoryLookup.filter(x=>x.petCategoryId === this.data.petCategory.petCategoryId)[0]);
          this.f['gender'].setValue(this.genderLookup.filter(x=>x.genderId === this.data.gender.genderId)[0]);
          console.log(this.formData);
        }
        this.isProcessing = false;
      }
  )
  }

  get isNew(){ return !this.data || !this.data.petId || this.data.petId === "" }

  get formData() {
    return this.petForm.value;
  }

  get f() { return this.petForm.controls; }

  get petCategoryFilterArg() {
    return this.formData.petType;
  }

  onSubmit(): void {
    if (this.petForm.valid) {
      const param = {
        petId: this.data ? this.data.petId : null,
        ...this.formData
      };
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Confirm';
      if(this.isNew){
        dialogData.message = 'Add pet?';
      }else{
        dialogData.message = 'Update added pet?';
      }
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
            this.conFirm.emit(param);
            dialogRef.close();
            this.isProcessing = false;
            dialogRef.componentInstance.isProcessing = this.isProcessing;
          } catch (e) {
            this.isLoading = false;
            this.error = Array.isArray(e.message) ? e.message[0] : e.message;
            this.snackBar.snackbarError(this.error);
            dialogRef.componentInstance.isProcessing = this.isProcessing;
          }
        }
      });
    }
  }

  getError(key:string){
    return this.f[key].errors;
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
