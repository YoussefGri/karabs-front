import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, throwError } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import { Router, ActivatedRoute } from "@angular/router"
import { environment } from "../../environments/environment"
import { Platform } from "@ionic/angular"
import { Browser } from "@capacitor/browser"
import { App } from "@capacitor/app"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  private apiUrl = environment.apiUrl

  constructor(
    private http: HttpClient,
    private router: Router,
    private platform: Platform,
    private route: ActivatedRoute,
  ) {
    this.initializeUser()

    // Écouter les événements d'URL pour Capacitor
    if (this.platform.is("capacitor")) {
      App.addListener("appUrlOpen", (data: any) => {
        this.handleAppUrlOpen(data.url)
      })
    }
  }

  private initializeUser() {
    const userJson = localStorage.getItem("currentUser")
    if (userJson) {
      const user = JSON.parse(userJson)
      this.currentUserSubject.next(user)
    }
  }

  // Méthode pour la connexion par email/mot de passe
  loginWithCredentials(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/login_check`, { username: email, password: password }).pipe(
      tap((response: any) => {
        // La réponse contient un token JWT
        const token = response.token
  
        // Récupérer les informations de l'utilisateur avec le token
        this.http
          .get(`${this.apiUrl}/api/user/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .subscribe({
            next: (user: any) => {
              const userData = {
                ...user,
                token: token,
              }
  
              localStorage.setItem("currentUser", JSON.stringify(userData))
              this.currentUserSubject.next(userData)
              
              // Rediriger selon le rôle
              if (user.roles.includes('ROLE_ADMIN')) {
                // Rediriger vers EasyAdmin
                window.location.href = `${this.apiUrl}/admin`;
              } else {
                // Nouvelle méthode pour actualiser la page après connexion
                this.reloadCurrentPage()
              }
            },
            error: (error) => {
              console.error("Erreur lors de la récupération des informations utilisateur:", error)
            }
          })
      }),
      catchError((error) => {
        console.error("Erreur de connexion:", error)
        return throwError(() => error)
      }),
    )
  }
  
  // Faites la même modification dans la méthode processToken pour gérer les connexions OAuth
  private processToken(token: string): void {
    this.http
      .get(`${this.apiUrl}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        tap((user: any) => {
          const userData = { ...user, token }
          localStorage.setItem("currentUser", JSON.stringify(userData))
          this.currentUserSubject.next(userData)
          
          // Rediriger selon le rôle
          if (user.roles.includes('ROLE_ADMIN')) {
            window.location.href = `${this.apiUrl}/admin`;
          } else {
            this.router.navigate(["/home"]) // Rediriger vers le profil après connexion
          }
        }),
        catchError((error) => {
          console.error("Erreur API:", error)
          this.router.navigate(["/login"]) // Rediriger vers la page de login en cas d'erreur
          return throwError(() => error)
        }),
      )
      .subscribe()
  }

  // Nouvelle méthode pour actualiser la page
  private reloadCurrentPage(): void {
    window.location.reload()
  }

async initiateOAuth(provider: string): Promise<void> {
  const isMobile = this.platform.is('capacitor')
  const redirectUrl = isMobile
    ? 'karabs://auth/callback'
    : window.location.href.split("?")[0]

  const oauthUrl = `${this.apiUrl}/connect/${provider}?redirect_url=${encodeURIComponent(redirectUrl)}`

  console.log("OAuth URL:", oauthUrl)

  try {
    if (isMobile) {
      // Validation manuelle : URL doit être absolue avec http(s)
      const isValidUrl = /^https?:\/\/.+$/.test(oauthUrl)
      if (!isValidUrl) {
        console.error("URL non valide (doit commencer par http(s)://)", oauthUrl)
        return
      }

      await this.platform.ready()
      await Browser.open({ url: oauthUrl })
    } else {
      window.location.href = oauthUrl
    }
  } catch (err) {
    console.error("Erreur lors de l'ouverture de l'URL OAuth :", err)
  }
}


  // async initiateOAuth(provider: string): Promise<void> {
  //   const currentUrl = window.location.href.split("?")[0]
  //   const redirectParam = `redirect_url=${encodeURIComponent(currentUrl)}`
  //   const oauthUrl = `${this.apiUrl}/connect/${provider}?${redirectParam}`

  //   if (this.platform.is("capacitor")) {
  //     await Browser.open({ url: oauthUrl })
  //     // La redirection sera gérée par l'écouteur appUrlOpen
  //   } else {
  //     window.location.href = oauthUrl
  //     // La redirection sera gérée par checkForAuthToken à la prochaine initialisation de la page
  //   }
  // }

  // Nouvelle méthode pour gérer les URLs d'ouverture d'application (pour Capacitor)
  private handleAppUrlOpen(url: string): void {
    const urlObj = new URL(url)
    const token = urlObj.searchParams.get("token")

    if (token) {
      this.processToken(token)
    }
  }

  // Méthode à appeler au démarrage de l'application pour vérifier si un token est présent dans l'URL
  checkForAuthToken(): void {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("token")

    if (token) {
      // Effacer le token de l'URL pour des raisons de sécurité
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)

      this.processToken(token)
    }
  }

  logout(): void {
    localStorage.removeItem("currentUser")
    this.currentUserSubject.next(null)
    this.router.navigate(["/login"])
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value
  }

  getToken(): string | null {
    const user = this.currentUserSubject.value
    return user ? user.token : null
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/reset-password/request`, { email })
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/reset-password/reset`, {
      token,
      password: newPassword,
    })
  }

  updateCurrentUser(userData: any): void {
    const currentUser = this.currentUserSubject.value
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      this.currentUserSubject.next(updatedUser)
    }
  }
}