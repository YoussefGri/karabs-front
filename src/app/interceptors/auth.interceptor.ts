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
  constructor(private alertCtrl: AlertController, private router: Router, private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('401 interceptée, redirection en cours...')

        if (error.status === 401) {
          this.presentSessionExpiredAlert()
        }
        return throwError(() => error) 
      })
    )
  }

  private async presentSessionExpiredAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Session expirée',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.authService.logout()
            this.router.navigate(['/login'])
          }
        }
      ]
    })

    await alert.present()
  }
}
