import { Component, type OnInit, HostListener } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { RouterModule } from "@angular/router"
import { AuthService } from "../../services/auth.service"
import { Platform } from "@ionic/angular"

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class NavbarComponent implements OnInit {
  isMobile = false

  constructor(
    private platform: Platform,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.checkScreenSize()
  }

  @HostListener("window:resize")
  checkScreenSize() {
    this.isMobile =
      window.innerWidth < 768 || this.platform.is("mobile") || this.platform.is("android") || this.platform.is("ios")
  }
}