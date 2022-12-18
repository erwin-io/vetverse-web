import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTimepickerModule } from 'src/app/core/directive/mat-timepicker/src/public-api';
import { MaterialModule } from 'src/app/material/material.module';
import { ReminderComponent } from './reminder.component';
import { ReminderAddComponent } from './reminder-add/reminder-add.component';


export const routes: Routes = [
  {
    path: '',
    component: ReminderComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    ReminderComponent,
    ReminderAddComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatTimepickerModule,
  ]
})
export class ReminderModule { }
