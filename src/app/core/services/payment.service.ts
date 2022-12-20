import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Payment } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class PaymentService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) {}

  get(): Observable<ApiResponse<Payment[]>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl + this.appconfig.config.apiEndPoints.payment.get
      )
      .pipe(
        tap((_) => this.log('payment')),
        catchError(this.handleError('payment', []))
      );
  }

  getById(appointmentId: string): Observable<ApiResponse<Payment>> {
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.payment.getById +
          appointmentId
      )
      .pipe(
        tap((_) => this.log('payment')),
        catchError(this.handleError('payment', []))
      );
  }

  create(data: any): Observable<ApiResponse<Payment>> {
    return this.http
      .post<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.payment.create,
        data
      )
      .pipe(
        tap((_) => this.log('payment')),
        catchError(this.handleError('payment', []))
      );
  }

  void(data: any): Observable<ApiResponse<Payment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.payment.void,
        data
      )
      .pipe(
        tap((_) => this.log('payment')),
        catchError(this.handleError('payment', []))
      );
  }

  updateReferenceNumber(data: any): Observable<ApiResponse<Payment>> {
    return this.http
      .put<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.payment.updateReferenceNumber,
        data
      )
      .pipe(
        tap((_) => this.log('payment')),
        catchError(this.handleError('payment', []))
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
