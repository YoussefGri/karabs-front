import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule, ToastController, LoadingController } from "@ionic/angular";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.page.html",
  styleUrls: ["./reset-password.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ResetPasswordPage {
  email = "";
  errorMessage = "";

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  async requestReset() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = "Veuillez entrer une adresse email valide";
      return;
    }

    const loading = await this.loadingController.create({
      message: "Envoi en cours...",
      spinner: "circles",
    });
    await loading.present();

    this.authService.requestPasswordReset(this.email).subscribe({
      next: async () => {
        await loading.dismiss();
        const toast = await this.toastController.create({
          message: "Email de réinitialisation envoyé.",
          duration: 3000,
          color: "success",
        });
        toast.present();
        this.router.navigate(["/login"]);
      },
      error: async (err) => {
        await loading.dismiss();
        this.errorMessage = "Aucun compte trouvé avec cet email.";
        const toast = await this.toastController.create({
          message: this.errorMessage,
          duration: 3000,
          color: "danger",
        });
        toast.present();
      },
    });
  }
}