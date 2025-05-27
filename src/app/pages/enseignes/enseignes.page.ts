import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { EnseignesService } from 'src/app/services/enseignes.service'
import { IonicModule } from '@ionic/angular'
import { CommonModule } from '@angular/common'
import { UtilsService } from 'src/app/services/utils.service'
import { MenuController } from '@ionic/angular'
import { LoadingController } from '@ionic/angular'
import { finalize } from 'rxjs/operators';
import { CategorieService } from 'src/app/services/categorie.service'


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
  categoryColor = ''
  isLoading = true

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
    private menuCtrl: MenuController,
    private utils: UtilsService,
    private loadingCtrl: LoadingController,
    private categorieService: CategorieService
  ) {}


  async loadEnseignes() {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des enseignes...',
      spinner: 'circles'
    });
  
    await loading.present();
  
    this.enseigneService.getEnseignesByCategory(this.categoryName)
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (data: any) => {
          this.enseignes = data.enseignes ?? data;
          this.favoris = data.favoris ?? [];
          
          const cat = this.enseignes[0]?.categorie;
          console.log('Catégorie:', cat);
          if (cat && cat.couleur) {
            const colorObj = this.utilsService.getCategoryColor(cat);
            this.categoryColor = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`;
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur de chargement', err);
          this.isLoading = false;
        }
      });
  }
  
  
  
  // ngOnInit() {
  //   this.categoryName = this.route.snapshot.paramMap.get('nom') || '';
  //   const colorObj = this.utilsService.getCategoryColor(this.categoryName);
  //   this.categoryColor = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`;
  
  //   this.loadEnseignes();
  // }

  ngOnInit() {
    this.categoryName = this.route.snapshot.paramMap.get('nom') || '';
    this.loadEnseignes();
  
    console.log('Category Name:', this.categoryName);
    // Si aucune enseigne, on va chercher la couleur manuellement
    this.categorieService.getCategorieByNom(this.categoryName).subscribe({
      next: (cat: any) => {
        if (cat?.couleur) {
          const colorObj = this.utilsService.getCategoryColor(cat);
          this.categoryColor = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${colorObj.a})`;
        }
      },
      error: () => {
        console.warn('Catégorie sans couleur ou introuvable');
      }
    });
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

  openInGoogleMaps(adresse: string) {
    if (!adresse?.trim()) {
      console.error('Adresse invalide')
      return
    }
    this.utilsService.openInGoogleMaps(adresse);
  }

  goToExplore() {
    this.router.navigate(['/explore'])
  }

  getCritereLabel(key: string): string {
    return this.criteres.find(c => c.key === key)?.label || ''
  }

  capitalizeFirstLetter(str: string): string {
    const decoded = decodeURIComponent(str);
    return decoded.charAt(0).toUpperCase() + decoded.slice(1).toLowerCase()
  }

  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions
  }

  goToEnseigneDetail(number: number) {
    this.utils.goToEnseigneDetail(number);
  }

  getStarIcon(note: number, position: number): string {

    return this.utilsService.getStarIcon(note, position);             
  }
}
