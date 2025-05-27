import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
private readonly excludedUrls = [
  '/api/reset-password/request',
  '/api/reset-password/reset'
];

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  const token = this.authService.getToken();
  const isApiUrl = request.url.startsWith(environment.apiUrl);
  const isExcluded = this.excludedUrls.some(url => request.url.includes(url));

  if (token && isApiUrl && !isExcluded) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next.handle(request);
}

}