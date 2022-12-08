import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordAndSecurityComponent } from './password-and-security.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material/material.module';

export const routes = [
  { path: '', component: PasswordAndSecurityComponent }
];

@NgModule({
  declarations: [
    PasswordAndSecurityComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class PasswordAndSecurityModule { }
