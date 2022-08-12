import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Staff } from '../model/staff.model';
import { ApiResponse } from '../model/api-response.model';
import { Client } from '../model/client.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // apiUrl = 'https://vetverse-api.herokuapp.com/api/v1/users/';
  apiUrl = 'http://localhost:3000/api/v1/users';

  constructor(private http: HttpClient) { }

  get(userTypeId: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '?userTypeId=' + userTypeId)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  getById(userId: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + "/" + userId)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  createStaff(data: any): Observable<ApiResponse<Staff>> {
    return this.http.post<any>(this.apiUrl + '/staff', data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  udpdateClient(data: any): Observable<ApiResponse<Client>> {
    return this.http.put<any>(this.apiUrl + '/client', data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  udpdateStaff(data: any): Observable<ApiResponse<Staff>> {
    return this.http.put<any>(this.apiUrl + '/staff', data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  toggleEnable(data: any): Observable<ApiResponse<Staff>> {
    return this.http.put<any>(this.apiUrl + '/toggleEnable', data)
    .pipe(
      tap(_ => this.log('user')),
      catchError(this.handleError('user', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  private log(message: string) {
    console.log(message);
  }
}
