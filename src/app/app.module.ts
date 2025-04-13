import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { RouteReuseStrategy } from "@angular/router"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"

import { IonicModule, IonicRouteStrategy } from "@ionic/angular"

import { AppComponent } from "./app.component"
import { AppRoutingModule } from "./app-routing.module"
import { JwtInterceptor } from "./interceptors/jwt.interceptor"
import { HomePage } from "./pages/home/home.page"
import { NavbarComponent } from "./components/navbar/navbar.component"
import { AuthInterceptor } from "./interceptors/auth.interceptor"

@NgModule({
  declarations: [AppComponent, HomePage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, NavbarComponent],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }

  ],
  bootstrap: [AppComponent],
})
export class AppModule {}