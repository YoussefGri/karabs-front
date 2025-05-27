import { Injectable } from '@angular/core'
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { AlertController } from '@ionic/angular'
import { Router } from '@angular/router'
import { AuthService } from '../services/auth.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isAlertPresented = false;
private readonly excludedUrls = [
  '/api/reset-password/request',
  '/api/reset-password/reset',
  'api/reset-password/confirm?token=hP3wXBPGzmnD4miYKx6ivJ4oT22O22MS6rBXgfwyKTs'
];

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const isExcluded = this.excludedUrls.some(url => req.url.includes(url));

  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !this.isAlertPresented && !isExcluded) {
        this.isAlertPresented = true;
        this.presentSessionExpiredAlert();
      }
      return throwError(() => error);
    })
  );
}


  private async presentSessionExpiredAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Session expirée',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      cssClass: 'custom-alert-class',
      backdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.isAlertPresented = false;
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }
}
