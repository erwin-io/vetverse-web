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
  generateReport() {
    const username = 'erwinramirez220@gmail.com',
      password = 'kingofcrossover';
    const httpOptions: any = {
      responseType: 'blob',
      observe: 'response',
      context: new HttpContext().set(BYPASS_LOG, true),
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(username + ':' + password),
      }),
    };
    return this.http
      .post<any>(
        'https://sample.jsreportonline.net/api/report',
        JSON.stringify({
          template: {
            name: 'invoice-main',
          },
          data: {
            number: '123',
            seller: {
              name: 'Next Step Webs, Inc.',
              road: '12345 Sunny Road',
              country: 'Sunnyville, TX 12345',
            },
            buyer: {
              name: 'Acme Corp.',
              road: '16 Johnson Road',
              country: 'Paris, France 8060',
            },
            items: [
              {
                name: 'Website design',
                price: 300,
              },
              {
                name: 'Website implementation',
                price: 1500,
              },
            ],
          },
        }),
        httpOptions
      ).pipe(
        tap(_ => this.log('reports')),
        catchError(this.handleError('reports', []))
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
