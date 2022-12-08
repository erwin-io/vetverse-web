import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { EditProfileDetailsComponent } from './edit-profile-details.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


export const routes = [
  { path: '', component: EditProfileDetailsComponent }
];


@NgModule({
  declarations: [
    EditProfileDetailsComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class EditProfileDetailsModule { }
