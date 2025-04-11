import { Component, OnInit } from "@angular/core"
import { AuthService } from "../../services/auth.service"
import { AlertController, NavController } from "@ionic/angular"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class ProfilePage implements OnInit {
  user: any = null

  profileSections = [
    {
      title: "Mon compte",
      icon: "person",
      color: "#cc2128",
      route: "/profile/account",
    },
    {
      title: "Activités préférées",
      icon: "heart",
      color: "#cc2128",
      route: "/profile/activities",
    },
    {
      title: "Notifications",
      icon: "notifications",
      color: "#cc2128",
      route: "/profile/notifications",
    },
    {
      title: "Paramètres de communauté",
      icon: "chatbubble",
      color: "#cc2128",
      route: "/profile/community",
    },
    {
      title: "Données et Stockage",
      icon: "pie-chart",
      color: "#cc2128",
      route: "/profile/data",
    },
    {
      title: "Paramètres de Confidentialité",
      icon: "lock-closed",
      color: "#cc2128",
      route: "/profile/privacy",
    },
    {
      title: "À propos du Krab's",
      icon: "information-circle",
      color: "#cc2128",
      route: "/profile/about",
    },
  ]

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private navCtrl: NavController,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user
    })
  }

  async logout() {
    const alert = await this.alertController.create({
      header: "Déconnexion",
      message: "Êtes-vous sûr de vouloir vous déconnecter?",
      buttons: [
        {
          text: "Annuler",
          role: "cancel",
        },
        {
          text: "Déconnexion",
          handler: () => {
            this.authService.logout()
          },
        },
      ],
    })

    await alert.present()
  }

  navigateTo(route: string) {
    this.navCtrl.navigateForward(route)
  }
}