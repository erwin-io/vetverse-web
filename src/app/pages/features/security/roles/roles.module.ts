import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EditRoleComponent } from './edit-role/edit-role.component';
import { ViewRoleComponent } from './view-role/view-role.component';
import { RolesComponent } from './roles.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export const routes: Routes = [
  {
    path: 'roles/details/:roleId',
    component: ViewRoleComponent
  },
  {
    path: 'roles/edit/:roleId',
    component: EditRoleComponent
  }
];

@NgModule({
  declarations: [RolesComponent,ViewRoleComponent,EditRoleComponent],
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
export class RolesModule { }
