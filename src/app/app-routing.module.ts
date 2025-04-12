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
    component: ExplorePage,
    canActivate: [AuthGuard],
  },
  {
    path: "explore/:nom",
    loadComponent: () =>
      import("./pages/enseignes/enseignes.page").then(m => m.EnseignesPage),
    canActivate: [AuthGuard],
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