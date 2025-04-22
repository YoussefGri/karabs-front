import { NgModule } from "@angular/core"
import { RouterModule, type Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"
import { NonAuthGuard } from "./guards/non-auth.guard"
import { LoginPage } from "./pages/login/login.page"
import { ProfilePage } from "./pages/profile/profile.page"
import { HomePage } from "./pages/home/home.page"
import { RegisterPage } from "./pages/register/register.page"
import { AccountPage } from "./pages/profile/account/account.page"
import { ExplorePage } from "./pages/explore/explore.page"
import { MapPage } from "./pages/map/map.page"

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
    path: "home",
    component: HomePage,
    canActivate: [AuthGuard],
  },
  {
    path: "explore",
    //component: ExplorePage,
    loadComponent: () => import('./pages/explore/explore.page').then(m => m.ExplorePage),
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
    path: 'map',
    loadComponent: () =>
      import("./pages/map/map.page").then(m => m.MapPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'map-modal',
    loadChildren: () => import('./pages/map-modal/map-modal.page').then( m => m.MapModalPage)
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