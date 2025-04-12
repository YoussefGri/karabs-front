import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-explore",
  templateUrl: "./explore.page.html",
  styleUrls: ["./explore.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class ExplorePage {
  categories = [
    {
      name: "Manger",
      image: "assets/manger.jpg",
      route: "/explore/manger",
    },
    {
      name: "Boire",
      image: "assets/boire.jpg",
      route: "/explore/boire",
    },
    {
      name: "Sortir",
      image: "assets/sortir.jpg",
      route: "/explore/sortir",
    },
    {
      name: "S'aérer",
      image: "assets/saerer.jpg",
      route: "/explore/aerer",
    },
    {
      name: "Travailler",
      image: "assets/travailler.jpg",
      route: "/explore/travailler",
    },
    {
      name: "Se cultiver",
      image: "assets/se_cultiver.png",
      route: "/explore/cultiver",
    },
    {
      name: "Toutes les catégories",
      image: "assets/default.jpg",
      route: "/explore/toutes",
    }
  ]

  constructor() {}
}

