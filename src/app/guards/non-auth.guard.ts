import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class NonAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      return true // User is not logged in, allow access
    } else {
      this.router.navigate(["/home"]) // Redirect to home if user is already logged in
      return false
    }
  }
}

