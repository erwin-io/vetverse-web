import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { UsersModule } from './users/users.module';
import { RolesComponent } from './roles/roles.component';
import { RolesModule } from './roles/roles.module';

export const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'users/staff',
    component: UsersComponent
  },
  {
    path: 'users/clients',
    component: UsersComponent
  },
  {
    path: 'roles',
    component: RolesComponent
  },

];


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    UsersModule,
    RolesModule,
    RouterModule.forChild(routes)
  ],
})

export class SecurityModule { }
