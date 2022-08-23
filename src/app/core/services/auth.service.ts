import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

import { catchError, tap } from 'rxjs/operators';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IServices {

  isLoggedIn = false;
  redirectUrl: string;

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + environment.apiEndPoints.auth.login, data)
    .pipe(
      tap(_ => this.isLoggedIn = true),
      catchError(this.handleError('login', []))
    );
  }

  logout(): Observable<any> {
    return this.http.get<any>(environment.apiBaseUrl + environment.apiEndPoints.auth.logout)
    .pipe(
      tap(_ => this.isLoggedIn = false),
      catchError(this.handleError('logout', []))
    );
  }

  register(data: any, userType: number){
    if(userType === 1){
      return this.registerStaff(data);
    }
    else{
      return this.registerClient(data);
    }
  }

  registerClient(data: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + environment.apiEndPoints.auth.register.client, data)
    .pipe(
      tap(_ => this.log('register')),
      catchError(this.handleError('register', []))
    );
  }

  registerStaff(data: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + environment.apiEndPoints.auth.register.staff, data)
    .pipe(
      tap(_ => this.log('register')),
      catchError(this.handleError('register', []))
    );
  }

  findByUsername(username: string): Observable<any> {
    return this.http.get<any>(environment.apiBaseUrl + environment.apiEndPoints.auth.findByUsername + username)
    .pipe(
      tap(_ => this.log('findByUsername')),
      catchError(this.handleError('findByUsername', []))
    );
  }

  refreshToken(data: any): Observable<any> {
    return this.http.post<any>(environment.apiBaseUrl + environment.apiEndPoints.auth.refreshToken, data)
    .pipe(
      tap(_ => this.log('refresh token')),
      catchError(this.handleError('refresh token', []))
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
