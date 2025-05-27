import { Component, OnInit } from "@angular/core"
import { AuthService } from "../../services/auth.service"
import { LoadingController, ToastController } from "@ionic/angular"
import { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { IonicModule } from "@ionic/angular"

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LoginPage implements OnInit {
  email = ""
  password = ""
  errorMessage = ""
  isLoading = false

  constructor(
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Vérifier s'il y a un token dans l'URL (après redirection OAuth)
    console.log("Vérification du token d'authentification")
    this.authService.checkForAuthToken()

    // Rediriger l'utilisateur connecté
    if (this.authService.isLoggedIn()) {
      console.log("Utilisateur déjà connecté, redirection vers la page d'accueil")
      this.router.navigate(["/home"])
    }
    else {
      console.log("Utilisateur non connecté, affichage de la page de connexion")
    }
  }

  async login() {
    // Validation basique
    if (!this.email || !this.password) {
      this.errorMessage = "Veuillez remplir tous les champs"
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const loading = await this.loadingController.create({
      message: "Connexion en cours...",
      spinner: "circles",
    })
    await loading.present()

    this.authService.loginWithCredentials(this.email, this.password).subscribe({
      next: async () => {
        loading.dismiss()
        this.isLoading = false

        const toast = await this.toastController.create({
          message: "Connexion réussie !",
          duration: 2000,
          position: "bottom",
          color: "success",
        })
        toast.present()

        this.router.navigate(["/home"])
      },
      error: async (error) => {
        loading.dismiss()
        this.isLoading = false

        let errorMsg = "Identifiants incorrects"
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

  async loginWithProvider(provider: string) {
    const loading = await this.loadingController.create({
      message: "Redirection vers le fournisseur...",
      spinner: "circles",
    })
    await loading.present()

    setTimeout(() => {
      loading.dismiss()
      this.authService.initiateOAuth(provider)
    }, 1000)
  }
}

