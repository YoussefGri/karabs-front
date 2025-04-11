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
  // Modèle pour les données du formulaire
  userData = {
    nom: "",
    prenom: "",
    email: "",
    password: "",
    ville: "",
    codePostal: "",
  }

  errorMessage = ""
  isSubmitting = false
  registerForm: any

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService, // Add AuthService
  ) {}

  ngOnInit() {
    // Redirect logged-in user
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/home"])
    }
  }

  async register() {
    // Rest of the code remains the same
    // Validation basique
    if (
      !this.userData.nom ||
      !this.userData.prenom ||
      !this.userData.email ||
      !this.userData.password ||
      !this.userData.ville ||
      !this.userData.codePostal
    ) {
      this.errorMessage = "Tous les champs sont obligatoires"
      return
    }

    // Validation du code postal (5 chiffres)
    const codePostalRegex = /^\d{5}$/
    if (!codePostalRegex.test(this.userData.codePostal)) {
      this.errorMessage = "Le code postal doit contenir 5 chiffres"
      return
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.userData.email)) {
      this.errorMessage = "Veuillez entrer une adresse email valide"
      return
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (this.userData.password.length < 6) {
      this.errorMessage = "Le mot de passe doit contenir au moins 6 caractères"
      return
    }

    this.isSubmitting = true
    this.errorMessage = ""

    const loading = await this.loadingController.create({
      message: "Inscription en cours...",
      spinner: "circles",
    })
    await loading.present()

    // Appel à l'API d'inscription
    this.http.post(`${environment.apiUrl}/api/register`, this.userData).subscribe({
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

