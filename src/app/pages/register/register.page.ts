import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { LoadingController, ToastController } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IonicModule } from "@ionic/angular"
import { HttpClient } from "@angular/common/http"
import { environment } from "../../../environments/environment"
import { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class RegisterPage implements OnInit {
  userData = {
    nom: "",
    prenom: "",
    email: "",
    password: "",
    ville: "",
    codePostal: "",
  }

  confirmPassword = ""
  errorMessage = ""
  isSubmitting = false
  registerForm: any
  emailInvalid = false;
passwordInvalid = false;
passwordMismatch = false;
confirmEmail = ""
emailMismatch = false

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.validateFormLive();
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/home"])
    }
  }

  validateFormLive() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  this.emailInvalid = this.userData.email.length > 0 && !emailRegex.test(this.userData.email)
  this.emailMismatch = this.userData.email !== this.confirmEmail && this.confirmEmail.length > 0

  this.passwordInvalid = this.userData.password.length > 0 && this.userData.password.length < 6
  this.passwordMismatch = this.userData.password !== this.confirmPassword && this.confirmPassword.length > 0
}


  async register() {
    if (
      !this.userData.nom ||
      !this.userData.prenom ||
      !this.userData.email ||
      !this.userData.password ||
      !this.userData.ville ||
      !this.userData.codePostal ||
      !this.confirmPassword
    ) {
      this.errorMessage = "Tous les champs sont obligatoires"
      return
    }

    const codePostalRegex = /^\d{5}$/
    if (!codePostalRegex.test(this.userData.codePostal)) {
      this.errorMessage = "Le code postal doit contenir 5 chiffres"
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.userData.email)) {
      this.errorMessage = "Veuillez entrer une adresse email valide"
      return
    }

    if (this.userData.password.length < 6) {
      this.errorMessage = "Le mot de passe doit contenir au moins 6 caractères"
      return
    }

    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = "Les mots de passe ne correspondent pas"
      return
    }

    this.isSubmitting = true
    this.errorMessage = ""

    const loading = await this.loadingController.create({
      message: "Inscription en cours...",
      spinner: "circles",
    })
    await loading.present()

    this.http.post(`${environment.apiUrl}/api/register`, this.userData, { withCredentials: true }).subscribe({
      next: async (response: any) => {
        loading.dismiss()
        this.isSubmitting = false

        const toast = await this.toastController.create({
          message: "Inscription réussie ! Vous pouvez maintenant vous connecter.",
          duration: 3000,
          position: "bottom",
          color: "success",
        })
        toast.present()

        this.router.navigate(["/login"])
      },
      error: async (error) => {
        loading.dismiss()
        this.isSubmitting = false

        let errorMsg = "Une erreur est survenue lors de l'inscription."
        if (error.error && error.error.message) {
          errorMsg = error.error.message
        }

        this.errorMessage = errorMsg

        const toast = await this.toastController.create({
          message: errorMsg,
          duration: 3000,
          position: "bottom",
          color: "danger",
        })
        toast.present()
      },
    })
  }
}
