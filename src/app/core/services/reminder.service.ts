import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Reminder } from '../model/reminder.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class ReminderService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  get(): Observable<ApiResponse<Reminder[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.reminder)
    .pipe(
      tap(_ => this.log('reminder')),
      catchError(this.handleError('reminder', []))
    );
  }

  getById(petTypeId: string): Observable<ApiResponse<Reminder>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.reminder + petTypeId)
    .pipe(
      tap(_ => this.log('reminder')),
      catchError(this.handleError('reminder', []))
    );
  }

  add(data: any): Observable<ApiResponse<Reminder>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.reminder, data)
    .pipe(
      tap(_ => this.log('reminder')),
      catchError(this.handleError('reminder', []))
    );
  }

  delete(petTypeId: string): Observable<ApiResponse<Reminder>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.reminder + petTypeId)
    .pipe(
      tap(_ => this.log('reminder')),
      catchError(this.handleError('reminder', []))
    );
  }

   handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}

