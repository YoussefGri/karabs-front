import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { RouteReuseStrategy } from "@angular/router"
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http"

import { IonicModule, IonicRouteStrategy } from "@ionic/angular"
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from "./app.component"
import { AppRoutingModule } from "./app-routing.module"
import { JwtInterceptor } from "./interceptors/jwt.interceptor"
import { NavbarComponent } from "./components/navbar/navbar.component"
import { AuthInterceptor } from "./interceptors/auth.interceptor"
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, NavbarComponent,BrowserAnimationsModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}