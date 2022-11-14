import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewRecordsComponent } from './view-records/view-records.component';
import { HealthRecordsComponent } from './health-records.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTimepickerModule } from 'src/app/core/directive/mat-timepicker/src/public-api';
import { MaterialModule } from 'src/app/material/material.module';

export const routes: Routes = [
  {
    path: '',
    component: HealthRecordsComponent,
    pathMatch: 'full'
  },
  {
    path: 'pet/:petId',
    component: ViewRecordsComponent
  }
];


@NgModule({
  declarations: [HealthRecordsComponent, ViewRecordsComponent],
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
export class HealthRecordsModule { }
