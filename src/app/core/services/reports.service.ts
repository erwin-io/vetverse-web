import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BYPASS_LOG } from '../interceptors/token.interceptors';
import { ApiResponse } from '../model/api-response.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private http: HttpClient, private appconfig: AppConfigService) {}

  generateServiceReport(params: any): Observable<any> {
    const config: any = {params, responseType: 'blob'};
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.reports.getServiceReport,
          config,
      );
  }

  generatePaymentsReport(params: any): Observable<any> {
    const config: any = {params, responseType: 'blob'};
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.reports.getPaymentsReport,
          config,
      );
  }

  generateAppointmentsReport(params: any): Observable<any> {
    const config: any = {params, responseType: 'blob'};
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.reports.getAppointmentsReport,
          config,
      );
  }

  generateClientsReport(): Observable<any> {
    const config: any = { responseType: 'blob' };
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.reports.getClientsReport,
          config,
      );
  }

  generatePetsReport(): Observable<any> {
    const config: any = { responseType: 'blob' };
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.reports.getPetsReport,
          config,
      );
  }

  generateStaffReport(): Observable<any> {
    const config: any = { responseType: 'blob' };
    return this.http
      .get<any>(
        environment.apiBaseUrl +
          this.appconfig.config.apiEndPoints.reports.getStaffReport,
          config,
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
