import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { RouterModule } from "@angular/router"
import { CategorieService } from "../../services/categorie.service"

@Component({
  selector: "app-categories",
  templateUrl: "./categories.page.html",
  styleUrls: ["./categories.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class ExplorePage implements OnInit {
  categories: any[] = []

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.categorieService.getCategories().subscribe((data) => {
      const dynamicCategories = data.map((cat) => ({
        name: cat.nom,
        image: cat.image || `assets/${this.getSafeImageFilename(cat.nom)}.jpg`,
        route: `/explore/${encodeURIComponent(cat.nom.toLowerCase())}`,
        color: cat.couleur
      }))
      console.log(dynamicCategories)

      this.categories = [
        {
          name: "Toutes les catégories",
          image: "assets/mtp.jpg",
          route: "/explore/toutes"
        },
        ...dynamicCategories
      ]
    })
  }

  getSafeImageFilename(nom: string): string {
    return nom
      .toLowerCase()
      .normalize('NFD') // décompose les accents
      .replace(/[\u0300-\u036f]/g, '') // supprime les accents
      .replace(/[^a-z0-9]/g, '_'); // remplace tout caractère non alphanumérique par _
  }
  

  getCategoryClasses(index: number): any {
    const classes = {
      'full-width-centered': this.categories.length % 2 === 1 && index === 0,
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
