import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PetTypeComponent } from './pet-type.component';
import { PetTypeAddComponent } from './pet-type-add/pet-type-add.component';

export const routes: Routes = [
  {
    path: '',
    component: PetTypeComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [PetTypeComponent, PetTypeAddComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ]
})
export class PetTypeModule { }
