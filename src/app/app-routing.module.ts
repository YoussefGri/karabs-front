import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"
import { NonAuthGuard } from "./guards/non-auth.guard"
import { LoginPage } from "./pages/login/login.page"
import { ProfilePage } from "./pages/profile/profile.page"
import { RegisterPage } from "./pages/register/register.page"
import { AccountPage } from "./pages/profile/account/account.page"
import { MapComponent } from "./pages/map/map.component"
import { HomeComponent } from "./pages/home/home.component"
import { APropos } from "./pages/profile/a-propos/a-propos.page"

const routes: Routes = [
  {
    path: "login",
    component: LoginPage,
    canActivate: [NonAuthGuard],
  },
  {
    path: "register",
    component: RegisterPage,
    canActivate: [NonAuthGuard],
  },
  {
    path: "profile",
    component: ProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: "profile/account",
    component: AccountPage,
    canActivate: [AuthGuard],
  },
  {
    path: "profile/a-propos",
    component: APropos,
    canActivate: [AuthGuard],
  },
  {
    path: "home",
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "map",
    component: MapComponent,
    canActivate: [AuthGuard],
  },
  {
  path: 'reset-password',
  loadComponent: () => import('./pages/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
  canActivate: [NonAuthGuard],
  },
  {
    path: 'reset-password/confirm',
    loadComponent: () => import('./pages/reset-password-confirm/reset-password-confirm.page').then(m => m.ResetPasswordConfirmPage),
    canActivate: [NonAuthGuard],
  },  
  {
    path: "categories",
    loadComponent: () => import('./pages/categories/categories.page').then(m => m.ExplorePage),
    canActivate: [AuthGuard],
  },
  {
    path: "explore/:nom",
    loadComponent: () =>
      import("./pages/enseignes/enseignes.page").then(m => m.EnseignesPage),
    canActivate: [AuthGuard],
  },
  {

    path : "favoris",
    loadComponent: () =>
      import("./pages/favoris/favoris.page").then(m => m.FavorisPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'enseigne/:id',
    loadComponent: () => 
      import('./pages/enseigne-detail/enseigne-detail.page').then(m => m.EnseigneDetailPage),
    canActivate: [AuthGuard] 
  },
  
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "home",
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}