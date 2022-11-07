import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentComponent } from './appointment.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ViewAppointmentComponent } from './view-appointment/view-appointment.component';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';
import { MatTimepickerModule } from 'src/app/core/directive/mat-timepicker/src/lib/mat-timepicker.module';
import { CallService } from 'src/app/core/services/call.service';

export const routes: Routes = [
  {
    path: '',
    component: AppointmentComponent,
    pathMatch: 'full'
  },
  {
    path: 'details/:appointmentId',
    component: ViewAppointmentComponent
  },
  {
    path: 'create',
    component: CreateAppointmentComponent
  },
];


@NgModule({
  declarations: [AppointmentComponent, ViewAppointmentComponent, CreateAppointmentComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatTimepickerModule,
  ],providers:[
    CallService]
})
export class AppointmentModule { }
