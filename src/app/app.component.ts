import { Component } from "@angular/core";
import { Platform } from "@ionic/angular";
import { AuthService } from "./services/auth.service";
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from "@angular/router";
import { LoaderService } from "./services/loader.service"; // ✅ import

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
    private loaderService: LoaderService // ✅ injecte le loader
  ) {
    this.initializeApp();
    this.setupRouterEvents(); // ✅ nouvelle méthode
  }

  showNavbar(): boolean {
    const excludedRoutes = ['/login', '/register', '/inscription'];
    return !excludedRoutes.includes(this.router.url);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      const currentUrl = window.location.pathname;
  
      if (!currentUrl.includes('/reset-password/confirm')) {
        this.authService.checkForAuthToken();
      }
    });
  }  

  private setupRouterEvents() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.loaderService.hide(), 300); // petit délai pour fluidité
      }
    });
  }
}
