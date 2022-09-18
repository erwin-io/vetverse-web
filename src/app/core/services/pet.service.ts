import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../model/api-response.model';
import { Pet } from '../model/appointment.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class PetService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  get(): Observable<ApiResponse<Pet[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  getById(petId: string): Observable<ApiResponse<Pet>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet + petId)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  add(data: any): Observable<ApiResponse<Pet>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet, data)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  udpdate(data: any): Observable<ApiResponse<Pet>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet, data)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
    );
  }

  delete(petId: string): Observable<ApiResponse<Pet>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.pet + petId)
    .pipe(
      tap(_ => this.log('pet')),
      catchError(this.handleError('pet', []))
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