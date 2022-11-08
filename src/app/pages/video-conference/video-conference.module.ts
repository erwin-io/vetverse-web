import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoConferenceComponent } from './video-conference.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { CallService } from 'src/app/core/services/call.service';
import { MaterialModule } from 'src/app/material/material.module';


export const routes: Routes = [
  {
    path: '',
    component: VideoConferenceComponent,
    pathMatch: 'full'
  },
  {
    path: ':appointmentId',
    component: VideoConferenceComponent,
  },
  {
    path: 'accept/:appointmentId',
    component: VideoConferenceComponent,
    data: {
      isClient: true
    }
  }
];


@NgModule({
  declarations: [VideoConferenceComponent],
  imports: [
    CommonModule,
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  providers:[
    CallService
  ]
})
export class VideoConferenceModule { }
