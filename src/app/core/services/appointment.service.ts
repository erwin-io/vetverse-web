import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Appointment, DiagnosisAttachments } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService implements IServices {
  constructor(private http: HttpClient, private appconfig: AppConfigService) {}

  get(): Observable<ApiResponse<Appointment[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.appointment.get
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  getByAdvanceSearch(params: any): Observable<ApiResponse<Appointment[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.getByAdvanceSearch,
          {params}
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  getById(appointmentId: string): Observable<ApiResponse<Appointment>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.getById +
          appointmentId
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  getAppointmentConferencePeer(appointmentId: string): Observable<ApiResponse<string>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.getAppointmentConferencePeer +
          appointmentId
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  getAppointmentsForADay(dateString: string): Observable<ApiResponse<Appointment[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.getAppointmentsForADay +
          dateString
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  createClientAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.createClientAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  createClientCashlessAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.createClientCashlessAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  createOnsiteAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.createOnsiteAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  createWalkInAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.createWalkInAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  rescheduleAppointment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.rescheduleAppointment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  updateAppointmentStatus(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.updateAppointmentStatus,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  updateAppointmentConferencePeer(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.updateAppointmentConferencePeer,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  updateAppointmentDiagnosisAndTreatment(data: any): Observable<ApiResponse<Appointment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.updateAppointmentDiagnosisAndTreatment,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  addDiagnosisAttachmentFile(data: any): Observable<ApiResponse<DiagnosisAttachments[]>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.appointment.addDiagnosisAttachmentFile,
        data
      )
      .pipe(
        tap((_) => this.log('appointment')),
        catchError(this.handleError('appointment', []))
      );
  }

  removeDiagnosisAttachmentFile(diagnosisAttachmentsId: string): Observable<ApiResponse<DiagnosisAttachments[]>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.appointment.removeDiagnosisAttachmentFile + diagnosisAttachmentsId)
    .pipe(
      tap(_ => this.log('appointment')),
      catchError(this.handleError('appointment', []))
    );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(
        `${operation} failed: ${
          Array.isArray(error.error.message)
            ? error.error.message[0]
            : error.error.message
        }`
      );
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
