import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController, LoadingController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password-confirm',
  templateUrl: './reset-password-confirm.page.html',
  styleUrls: ['./reset-password-confirm.page.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule, CommonModule],
})
export class ResetPasswordConfirmPage {
  token = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  async resetPassword() {
    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Réinitialisation...',
      spinner: 'circles',
    });
    await loading.present();

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Mot de passe mis à jour avec succès.',
          duration: 3000,
          color: 'success',
        });
        toast.present();
        this.router.navigate(['/login']);
      },
      error: async () => {
        await loading.dismiss();
        this.errorMessage = 'Le lien est invalide ou expiré.';
        const toast = await this.toastController.create({
          message: this.errorMessage,
          duration: 3000,
          color: 'danger',
        });
        toast.present();
      },
    });
  }
}
