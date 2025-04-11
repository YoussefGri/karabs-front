import { Component } from "@angular/core"
import { Platform } from "@ionic/angular"
import { AuthService } from "./services/auth.service"
import { Router } from "@angular/router"

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initializeApp()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Vérifier s'il y a un token dans l'URL après une redirection OAuth
      this.authService.checkForAuthToken()
    })
  }
}