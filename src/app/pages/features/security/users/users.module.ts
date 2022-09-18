import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../../../../../app/material/material.module';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export const routes: Routes = [
  {
    path: 'users/add/staff',
    component: AddUserComponent
  },
  {
    path: 'users/add/clients',
    component: AddUserComponent
  },
  {
    path: 'users/details/:userId',
    component: ViewUserComponent
  },
  {
    path: 'users/edit/:userId',
    component: EditUserComponent
  }
];


@NgModule({
  declarations: [UsersComponent, EditUserComponent, AddUserComponent, ViewUserComponent],
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
export class UsersModule { }
