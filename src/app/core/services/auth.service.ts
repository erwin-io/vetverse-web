import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = 'https://vetverse-api.herokuapp.com/api/v1/auth/';
  // apiUrl = 'http://localhost:3000/api/v1/auth/';
  isLoggedIn = false;
  redirectUrl: string;

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'login', data)
    .pipe(
      tap(_ => this.isLoggedIn = true),
      catchError(this.handleError('login', []))
    );
  }

  logout(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'logout')
    .pipe(
      tap(_ => this.isLoggedIn = false),
      catchError(this.handleError('logout', []))
    );
  }

  registerClient(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'register/client', data)
    .pipe(
      tap(_ => this.log('register')),
      catchError(this.handleError('register', []))
    );
  }

  registerStaff(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'register/staff', data)
    .pipe(
      tap(_ => this.log('register')),
      catchError(this.handleError('register', []))
    );
  }

  findByUsername(username: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'findByUsername/'+ username)
    .pipe(
      tap(_ => this.log('findByUsername')),
      catchError(this.handleError('findByUsername', []))
    );
  }

  refreshToken(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'refresh-token', data)
    .pipe(
      tap(_ => this.log('refresh token')),
      catchError(this.handleError('refresh token', []))
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
