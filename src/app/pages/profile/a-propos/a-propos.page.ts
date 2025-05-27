import { CommonModule } from "@angular/common";
import { Component } from "@angular/core"
import { IonicModule } from "@ionic/angular";
import { IonHeader, IonToolbar } from "@ionic/angular/standalone";

@Component({
  selector: "app-a-propos",
  templateUrl: "./a-propos.page.html",
  styleUrls: ["./a-propos.page.scss"],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class APropos {
 }

