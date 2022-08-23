import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Role } from '../model/role.model';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class RoleService implements IServices {

  constructor(private http: HttpClient) { }

  get(): Observable<ApiResponse<Role[]>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.apiEndPoints.role)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  getById(roleId: string): Observable<ApiResponse<Role>> {
    return this.http.get<any>(environment.apiBaseUrl + environment.apiEndPoints.role + roleId)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<Role>> {
    return this.http.put<any>(environment.apiBaseUrl + environment.apiEndPoints.role, data)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
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
