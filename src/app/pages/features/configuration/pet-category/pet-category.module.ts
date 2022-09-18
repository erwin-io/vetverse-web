import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PetCategoryComponent } from './pet-category.component';
import { PetCategoryAddComponent } from './pet-category-add/pet-category-add.component';
export const routes: Routes = [
  {
    path: '',
    component: PetCategoryComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [PetCategoryComponent, PetCategoryAddComponent],
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
export class PetCategoryModule { }
