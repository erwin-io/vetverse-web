import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiResponse } from '../model/api-response.model';
import { Role } from '../model/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  apiUrl = 'https://vetverse-api.herokuapp.com/api/v1/roles';
  // apiUrl = 'http://localhost:3000/api/v1/roles';

  constructor(private http: HttpClient) { }

  get(): Observable<ApiResponse<Role[]>> {
    return this.http.get<any>(this.apiUrl)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  getById(roleId: string): Observable<ApiResponse<Role>> {
    return this.http.get<any>(this.apiUrl + "/" + roleId)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  create(data: any): Observable<ApiResponse<Role>> {
    return this.http.post<any>(this.apiUrl, data)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<Role>> {
    return this.http.put<any>(this.apiUrl, data)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
    );
  }

  delete(roleId: string): Observable<ApiResponse<Role>> {
    return this.http.delete<any>(this.apiUrl + "/" + roleId)
    .pipe(
      tap(_ => this.log('role')),
      catchError(this.handleError('role', []))
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
