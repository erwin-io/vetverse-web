import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TokenInterceptor } from './core/interceptors/token.interceptors';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { CommonModule } from '@angular/common';
import { FeaturesComponent } from './pages/features/features.component';
import { MenuListItemComponent } from './pages/features/ui/menu-list-item/menu-list-item.component';
import { FormFieldErrorComponent } from './shared/form-field-error/form-field-error.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';
import { AlertDialogComponent } from './shared/alert-dialog/alert-dialog.component';
import { AppConfigService } from './core/services/app-config.service';
import { ScheduleDialogComponent } from './component/schedule-dialog/schedule-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTimepickerModule } from './core/directive/mat-timepicker/src/lib/mat-timepicker.module';
import { AddPaymentComponent } from './component/add-payment/add-payment.component';
import { SelectPeopleComponent } from './component/select-people/select-people.component';
import { AddPetComponent } from './component/add-pet/add-pet.component';
import { PetCategoryByPetTypePipe } from './core/pipe/pet-category-by-pet-type.pipe';
import { UpdateUserPasswordComponent } from './component/update-user-password/update-user-password.component';
import { ViewClientInfoComponent } from './component/view-client-info/view-client-info.component';
import { ViewPetInfoComponent } from './component/view-pet-info/view-pet-info.component';
import { ViewVeterinarianInfoComponent } from './component/view-veterinarian-info/view-veterinarian-info.component';
import { MessageComponent } from './component/message/message.component';
import { CallService } from './core/services/call.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ViewDiagnosisTreatmentComponent } from './component/view-diagnosis-treatment/view-diagnosis-treatment.component';
import { YearPickerDialogComponent } from './component/year-picker-dialog/year-picker-dialog.component';
import { CalendarPickerDialogComponent } from './component/calendar-picker-dialog/calendar-picker-dialog.component';
import { NumberLeadZeroPipePipe } from './core/pipe/number-lead-zero.pipe.pipe';
import { ProfileComponent } from './pages/profile/profile.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MenuListItemComponent,
    FeaturesComponent,
    ProfileComponent,
    FormFieldErrorComponent,
    SnackbarComponent,
    AlertDialogComponent,
    ScheduleDialogComponent,
    AddPaymentComponent,
    SelectPeopleComponent,
    AddPetComponent,
    PetCategoryByPetTypePipe,
    UpdateUserPasswordComponent,
    ViewClientInfoComponent,
    ViewPetInfoComponent,
    ViewVeterinarianInfoComponent,
    MessageComponent,
    ViewDiagnosisTreatmentComponent,
    YearPickerDialogComponent,
    CalendarPickerDialogComponent,
    NumberLeadZeroPipePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatTimepickerModule,
    NgApexchartsModule,
  ],
  providers: [
    CallService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500} },
    {
      provide : APP_INITIALIZER,
      multi : true,
      deps : [AppConfigService],
      useFactory : (config : AppConfigService) =>  () => config.loadAppConfig()
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
