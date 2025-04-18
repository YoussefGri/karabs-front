import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { EnseignesService } from 'src/app/services/enseignes.service'
import { IonicModule } from '@ionic/angular'
import { CommonModule } from '@angular/common'
import { UtilsService } from 'src/app/services/utils.service'
import { MenuController } from '@ionic/angular'

@Component({
  selector: 'app-enseignes',
  templateUrl: './enseignes.page.html',
  styleUrls: ['./enseignes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class EnseignesPage implements OnInit {
  categoryName = ''
  enseignes: any[] = []
  favoris: number[] = []
  showFilterOptions = false
  selectedCriteres: string[] = []

  criteres = [
    { key: 'noteMoyenne', label: 'Note Moyenne' },
    { key: 'noteAmbiance', label: 'Ambiance' },
    { key: 'notePrix', label: 'Prix' },
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enseigneService: EnseignesService,
    private utilsService: UtilsService,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.categoryName = this.route.snapshot.paramMap.get('nom') || ''
    this.enseigneService.getEnseignesByCategory(this.categoryName).subscribe((data: any) => {
      this.enseignes = data.enseignes ?? data
      this.favoris = data.favoris ?? []
    })
  }

  openMenu() {
    this.menuCtrl.open('end');
  }

  closeMenu() {
    this.menuCtrl.close('end');
  }

  toggleFavori(enseigne: any) {
    const index = this.favoris.indexOf(enseigne.id)
    if (index > -1) {
      this.favoris.splice(index, 1)
      this.enseigneService.removeFavori(enseigne.id).subscribe()
    } else {
      this.favoris.push(enseigne.id)
      this.enseigneService.addFavori(enseigne.id).subscribe()
    }
  }

  isFavori(id: number): boolean {
    return this.favoris.includes(id)
  }

  toggleCritere(key: string) {
    const index = this.selectedCriteres.indexOf(key)
    if (index > -1) this.selectedCriteres.splice(index, 1)
    else this.selectedCriteres.push(key)
    this.sortEnseignes()

    if (this.selectedCriteres.length === 0) {
      this.closeMenu();
    }
  }

  sortEnseignes() {
    this.enseignes.sort((a, b) => {
      for (const key of this.selectedCriteres) {
        if ((b[key] ?? 0) !== (a[key] ?? 0)) {
          return (b[key] ?? 0) - (a[key] ?? 0)
        }
      }
      return 0
    })
  }

  openInGoogleMaps(enseigne: any) {
    this.utilsService.openInGoogleMaps(enseigne);
  }

  goToExplore() {
    this.router.navigate(['/explore'])
  }

  getCritereLabel(key: string): string {
    return this.criteres.find(c => c.key === key)?.label || ''
  }

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions
  }
}
