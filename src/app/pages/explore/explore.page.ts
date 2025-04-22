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
      name: "Toutes les catégories",
      image: "assets/default.jpg",
      route: "/explore/toutes",
    },
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
      route: "/explore/s'aérer",
    },
    {
      name: "Travailler",
      image: "assets/travailler.jpg",
      route: "/explore/travailler",
    },
    {
      name: "Se cultiver",
      image: "assets/se_cultiver.png",
      route: "/explore/se cultiver",
    }
  ]

  constructor() {}

  getCategoryClasses(index: number): any {
    const classes = {
      'full-width-centered': this.categories.length % 2 === 1 && index === 0,//this.categories.length - 1,
      'shadow-color-1': index % 6 === 0,
      'shadow-color-2': index % 6 === 1,
      'shadow-color-3': index % 6 === 2,
      'shadow-color-4': index % 6 === 3,
      'shadow-color-5': index % 6 === 4,
      'shadow-color-6': index % 6 === 5
    };
    return classes;
  }
}

