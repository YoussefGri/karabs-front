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

  showNavbar(): boolean {
    const excludedRoutes = ['/login', '/register', '/inscription']; // Ajoutez tous les chemins où la navbar ne doit pas apparaître
    return !excludedRoutes.includes(this.router.url);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Vérifier s'il y a un token dans l'URL après une redirection OAuth
      this.authService.checkForAuthToken()
    })
  }
}