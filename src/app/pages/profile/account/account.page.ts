import { Component, OnInit } from "@angular/core"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { AuthService } from "../../../services/auth.service"
import { UserService } from "../../../services/user.service"
import { ToastController, LoadingController, NavController } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { Router } from "@angular/router"

@Component({
  selector: "app-account",
  templateUrl: "./account.page.html",
  styleUrls: ["./account.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class AccountPage implements OnInit {
  user: any = null
  accountForm: FormGroup
  selectedFile: File | null = null
  previewUrl: string | null = null

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    private router: Router,
  ) {
    this.accountForm = this.formBuilder.group({
      prenom: ["", Validators.required],
      nom: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      ville: [""],
      codePostal: ["", Validators.pattern("^[0-9]{5}$")],
    })
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user
        this.accountForm.patchValue({
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          ville: user.ville || "",
          codePostal: user.codePostal || "",
        })
        this.previewUrl = user.avatar
      }
    })
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.selectedFile = file

      // Créer une prévisualisation
      const reader = new FileReader()
      reader.onload = () => {
        this.previewUrl = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  async updateAccount() {
    if (this.accountForm.invalid) {
      return
    }

    const loading = await this.loadingController.create({
      message: "Mise à jour en cours...",
    })
    await loading.present()

    // Mettre à jour les informations du profil
    this.userService.updateUserProfile(this.accountForm.value).subscribe({
      next: async (response) => {
        // Si un fichier a été sélectionné, mettre à jour l'avatar
        if (this.selectedFile) {
          this.userService.updateUserAvatar(this.selectedFile).subscribe({
            next: async (avatarResponse) => {
              loading.dismiss()

              // Mettre à jour les informations utilisateur dans le service d'authentification
              const updatedUser = {
                ...this.user,
                ...this.accountForm.value,
                name: this.accountForm.value.prenom + " " + this.accountForm.value.nom,
                avatar: avatarResponse.avatarUrl,
              }
              this.authService.updateCurrentUser(updatedUser)

              const toast = await this.toastController.create({
                message: "Compte mis à jour avec succès",
                duration: 2000,
                color: "success",
              })
              toast.present()

              // Naviguer vers la page de profil pour voir les changements
              this.router.navigateByUrl("/profile", { replaceUrl: true })
            },
            error: async (error) => {
              loading.dismiss()
              const toast = await this.toastController.create({
                message: "Erreur lors de la mise à jour de l'avatar",
                duration: 2000,
                color: "danger",
              })
              toast.present()
            },
          })
        } else {
          loading.dismiss()

          // Mettre à jour les informations utilisateur dans le service d'authentification
          const updatedUser = {
            ...this.user,
            ...this.accountForm.value,
            name: this.accountForm.value.prenom + " " + this.accountForm.value.nom,
          }
          this.authService.updateCurrentUser(updatedUser)

          const toast = await this.toastController.create({
            message: "Compte mis à jour avec succès",
            duration: 2000,
            color: "success",
          })
          toast.present()

          // Naviguer vers la page de profil pour voir les changements
          this.router.navigateByUrl("/profile", { replaceUrl: true })
        }
      },
      error: async (error) => {
        loading.dismiss()
        const toast = await this.toastController.create({
          message: "Erreur lors de la mise à jour du compte",
          duration: 2000,
          color: "danger",
        })
        toast.present()
      },
    })
  }
}

