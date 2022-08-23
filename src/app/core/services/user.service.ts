import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Staff } from '../model/staff.model';
import { ApiResponse } from '../model/api-response.model';
import { Client } from '../model/client.model';
import { environment } from '../../../environments/environment';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class UserService implements IServices {

  constructor(private http: HttpClient) { }

  get(userTypeId: string): Observable<any> {
    return this.http.get<any>(environment.apiBaseUrl + environment.apiEndPoints.user.get + userTypeId)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  getById(userId: string): Observable<any> {
    return this.http.get<any>(environment.apiBaseUrl + environment.apiEndPoints.user.getById + userId)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  createStaff(data: any): Observable<ApiResponse<Staff>> {
    return this.http.post<any>(environment.apiBaseUrl + environment.apiEndPoints.user.createStaff, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  udpdateClient(data: any): Observable<ApiResponse<Client>> {
    return this.http.put<any>(environment.apiBaseUrl + environment.apiEndPoints.user.udpdateClient, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  udpdateStaff(data: any): Observable<ApiResponse<Staff>> {
    return this.http.put<any>(environment.apiBaseUrl + environment.apiEndPoints.user.udpdateStaff, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  toggleEnable(data: any): Observable<ApiResponse<Staff>> {
    return this.http.put<any>(environment.apiBaseUrl + environment.apiEndPoints.user.toggleEnable, data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
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
