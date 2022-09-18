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
  selector: 'app-pet-category-add',
  templateUrl: './pet-category-add.component.html',
  styleUrls: ['./pet-category-add.component.scss']
})
export class PetCategoryAddComponent implements OnInit {

  data: { petCategoryId?: string } = {};
  petCategoryForm: FormGroup;
  conFirm = new EventEmitter();
  isProcessing = false;
  isLoading = false;
  isLoadingLookup = false;
  error;
  // petCategoryFilterArg: { petTypeId: string } = { petTypeId: ''};
  petTypeLookup: PetType[]=[];
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: Snackbar,
    private petTypeService: PetTypeService,
    private petCategoryService: PetCategoryService,
    private appconfig: AppConfigService,
    public dialogRef: MatDialogRef<PetCategoryAddComponent>
  ) {
    this.petCategoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      petTypeId: [null, Validators.required],
    });
    this.initLookup();
    dialogRef.disableClose = true;

  }
  ngOnInit(): void {
  }

  initLookup(){
    this.isProcessing = true;
    forkJoin(
      this.petTypeService.get(),
  ).subscribe(
      ([getPetTypeService]) => {
          // do things
          this.petTypeLookup = getPetTypeService.data;
      },
      (error) => console.error(error),
      () => {
        if(!this.isNew){
          this.getData();
          console.log(this.formData);
        }
        this.isProcessing = false;
      }
  )
  }

  getData(){
    try {
      this.isLoading = true;
      this.
      petCategoryService
        .getById(this.data.petCategoryId)
        .subscribe(
          async (res) => {
            if (res.success) {
              this.f['name'].setValue(res.data.name);
              const petType = this.petTypeLookup.filter(x=>x.petTypeId === res.data.petType.petTypeId)[0];
              this.f['petTypeId'].setValue(petType?.petTypeId);
              this.isLoading = false;
            } else {
              this.isLoading = false;
              this.error = Array.isArray(res.message)
                ? res.message[0]
                : res.message;
              this.snackBar.snackbarError(this.error);
            }
          },
          async (err) => {
            this.isLoading = false;
            this.error = Array.isArray(err.message)
              ? err.message[0]
              : err.message;
            this.snackBar.snackbarError(this.error);
          }
        );
    }catch(err){
      this.isLoading = false;
      this.error = Array.isArray(err.message)
        ? err.message[0]
        : err.message;
      this.snackBar.snackbarError(this.error);
    }
  }

  ngAfterViewInit(): void {
  }

  get isNew(){ return !this.data || !this.data.petCategoryId || this.data.petCategoryId === "" }

  get formData() {
    return this.petCategoryForm.value;
  }

  get f() { return this.petCategoryForm.controls; }

  onSubmit(): void {
    if (this.petCategoryForm.valid) {
      const param = {
        petCategoryId: this.data ? this.data.petCategoryId : null,
        ...this.formData
      };
      const dialogData = new AlertDialogModel();
      dialogData.title = 'Confirm';
      dialogData.message = 'Save?';
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
            if(this.isNew) {
              await this.
              petCategoryService
                .add(param)
                .subscribe(
                  async (res) => {
                    if (res.success) {
                      this.conFirm.emit(true);
                      this.snackBar.snackbarSuccess("Saved!");
                      dialogRef.close();
                      this.isProcessing = false;
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    } else {
                      this.isProcessing = false;
                      this.error = Array.isArray(res.message)
                        ? res.message[0]
                        : res.message;
                      this.snackBar.snackbarError(this.error);
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    }
                  },
                  async (err) => {
                    this.isLoading = false;
                    this.error = Array.isArray(err.message)
                      ? err.message[0]
                      : err.message;
                    this.snackBar.snackbarError(this.error);
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                  }
                );
            }
            else {
              await this.
              petCategoryService
                .udpdate(param)
                .subscribe(
                  async (res) => {
                    if (res.success) {
                      this.conFirm.emit(true);
                      this.snackBar.snackbarSuccess("Saved!");
                      dialogRef.close();
                      this.isProcessing = false;
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    } else {
                      this.isProcessing = false;
                      this.error = Array.isArray(res.message)
                        ? res.message[0]
                        : res.message;
                      this.snackBar.snackbarError(this.error);
                      dialogRef.componentInstance.isProcessing = this.isProcessing;
                    }
                  },
                  async (err) => {
                    this.isLoading = false;
                    this.error = Array.isArray(err.message)
                      ? err.message[0]
                      : err.message;
                    this.snackBar.snackbarError(this.error);
                    dialogRef.componentInstance.isProcessing = this.isProcessing;
                  }
                );
            }
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
