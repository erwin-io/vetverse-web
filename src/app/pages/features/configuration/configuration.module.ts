import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceTypeModule } from './service-type/service-type.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { ServiceTypeComponent } from './service-type/service-type.component';
import { PetTypeComponent } from './pet-type/pet-type.component';
import { PetCategoryComponent } from './pet-category/pet-category.component';
import { PetTypeModule } from './pet-type/pet-type.module';
import { PetCategoryModule } from './pet-category/pet-category.module';


export const routes: Routes = [
  {
    path: 'service-type',
    component: ServiceTypeComponent
  },
  {
    path: 'pet-type',
    component: PetTypeComponent
  },
  {
    path: 'pet-category',
    component: PetCategoryComponent
  },

];


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ServiceTypeModule,
    PetTypeModule,
    PetCategoryModule,
    RouterModule.forChild(routes)
  ],
})

export class ConfigurationModule { }
