import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceTypeComponent } from './service-type.component';
import { ServiceTypeAddComponent } from './service-type-add/service-type-add.component';

export const routes: Routes = [
  {
    path: '',
    component: ServiceTypeComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [ServiceTypeComponent, ServiceTypeAddComponent],
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
export class ServiceTypeModule { }
