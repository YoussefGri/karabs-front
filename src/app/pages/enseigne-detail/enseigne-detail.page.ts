import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EnseignesService } from '../../services/enseignes.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { LoadingController, ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { interval, Subscription } from 'rxjs';
import { HorairesModalComponent } from '../../components/horaires-modal/horaires-modal.component';
import { FormsModule } from '@angular/forms';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-enseigne-detail',
  templateUrl: './enseigne-detail.page.html',
  styleUrls: ['./enseigne-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EnseigneDetailPage implements OnInit, OnDestroy {
  enseigne: any = {}; 
  isLoading = true;
  isFavorite = false;
  enseigneImages: string[] = [];
  currentSlide = 0;
  autoplayInterval: Subscription | null = null;
  
  userRatings: { [key: string]: number } = {
    'prix': 0,
    'qualite': 0,
    'ambiance': 0
  };
  
  ratingLabels: { [key: string]: string } = {
    'prix': 'Prix',
    'qualite': 'Qualité', 
    'ambiance': 'Ambiance'
  };
  
  ratingInProgress = false;
  
  constructor(
    private route: ActivatedRoute,
    private enseigneService: EnseignesService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private utilsService: UtilsService
  ) {}
  
  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des détails...',
      spinner: 'circles'
    });
    await loading.present();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.handleError('Identifiant d\'enseigne non trouvé');
      loading.dismiss();
      return;
    }
    
    this.enseigneService.getEnseigneById(Number(id))
      .pipe(
        finalize(() => {
          loading.dismiss();
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.enseigne = data;
          this.enrichEnseigneData();
          this.setupCarousel();
          this.startAutoplay();
          
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement:', err);
          this.handleError('Impossible de charger les détails de l\'enseigne.');
        }
      });
  }
  
  
  
  ngOnDestroy() {
    this.stopAutoplay();
  }
  
  private enrichEnseigneData() {
    if (!this.enseigne) return;
  
    if (!this.enseigne.categorie) {
      this.enseigne.categorie = 'Restaurant';
    }
  
    if (Array.isArray(this.enseigne.points_cle)) {
      const pointsArray = this.enseigne.points_cle;
      this.enseigne.pointsCleArray = pointsArray;
    
      this.enseigne.pointCle1 = pointsArray[0] || null;
      this.enseigne.pointCle2 = pointsArray[1] || null;
      this.enseigne.pointCle3 = pointsArray[2] || null;
    } else {
      console.warn('Format inattendu pour points_cle:', this.enseigne.points_cle);
      this.enseigne.pointsCleArray = [];
      this.enseigne.pointCle1 = null;
      this.enseigne.pointCle2 = null;
      this.enseigne.pointCle3 = null;
    }
    if (!this.enseigne.slogan) {
      this.enseigne.slogan = '';
    }
  }
  
  private setupCarousel() {
    if (this.enseigne.images && Array.isArray(this.enseigne.images) && this.enseigne.images.length > 0) {
      this.enseigneImages = this.enseigne.images;
    } else {
      this.enseigneImages = [
        'assets/default.jpg',
        'assets/default.jpg',
        'assets/default.jpg'
      ];
    }
  }
  
  nextSlide() {
    this.resetAutoplayTimer();
    this.currentSlide = (this.currentSlide + 1) % this.enseigneImages.length;
  }
  
  prevSlide() {
    this.resetAutoplayTimer();
    this.currentSlide = (this.currentSlide - 1 + this.enseigneImages.length) % this.enseigneImages.length;
  }
  
  goToSlide(index: number) {
    this.resetAutoplayTimer();
    this.currentSlide = index;
  }
  
  startAutoplay() {
    if (this.enseigneImages.length <= 1) return;
    this.stopAutoplay();
    this.autoplayInterval = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      this.autoplayInterval.unsubscribe();
      this.autoplayInterval = null;
    }
  }
  
  resetAutoplayTimer() {
    this.stopAutoplay();
    this.startAutoplay();
  }
  
  async rateEnseigne(category: string, rating: number) {
    if (!this.enseigne?.id) return;
    
    this.ratingInProgress = true;
    this.userRatings[category] = rating;
    
    const loading = await this.loadingCtrl.create({
      message: 'Enregistrement de votre note...',
      spinner: 'circles',
      duration: 2000
    });
    await loading.present();
    
    this.enseigneService.rateEnseigne(this.enseigne.id, category, rating)
      .pipe(
        finalize(() => {
          loading.dismiss();
          this.ratingInProgress = false;
        })
      )
      .subscribe({
        next: (updatedEnseigne: any) => {
          if (updatedEnseigne) {
            if (category === 'prix') this.enseigne.notePrix = updatedEnseigne.notePrix || this.enseigne.notePrix;
            if (category === 'qualite') this.enseigne.noteQualite = updatedEnseigne.noteQualite || this.enseigne.noteQualite;
            if (category === 'ambiance') this.enseigne.noteAmbiance = updatedEnseigne.noteAmbiance || this.enseigne.noteAmbiance;
            
            this.enseigne.noteMoyenne = Math.round(((this.enseigne.notePrix + this.enseigne.noteQualite + this.enseigne.noteAmbiance) / 3) * 10) / 10;
          }
          this.showToast(`Note ${this.ratingLabels[category]} enregistrée`);
        },
        error: (err: any) => {
          console.error('Erreur lors de la notation:', err);
          this.handleError('Impossible d\'enregistrer votre note');
          this.userRatings[category] = 0;
        }
      });
  }
  
  getStarsArray(count: number): number[] {
    return Array(5).fill(0).map((_, i) => i < count ? 1 : 0);
  }
  
  toggleFavorite() {
    if (!this.enseigne?.id) return;
    
    const previousState = this.isFavorite;
    this.isFavorite = !this.isFavorite;
    
    const action = this.isFavorite ?
      this.enseigneService.addFavori(this.enseigne.id) :
      this.enseigneService.removeFavori(this.enseigne.id);
      
    action.subscribe({
      next: () => this.showToast(this.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris'),
      error: (err: any) => {
        console.error('Erreur:', err);
        this.isFavorite = previousState;
        this.handleError('Erreur lors de la mise à jour des favoris');
      }
    });
  }
  
  async shareEnseigneInfo() {
    if (!this.enseigne) return;
    
    try {
      await Share.share({
        title: this.enseigne.nom,
        text: `Découvrez ${this.enseigne.nom} - ${this.enseigne.categorie || 'Restaurant'} sur Le Krab's`,
        url: `https://lekrabs.com/enseignes/${this.enseigne.id}`,
        dialogTitle: 'Partager via'
      });
    } catch (err) {
      console.error('Erreur de partage:', err);
      this.handleError('Partage non disponible');
    }
  }
  
  async openInGoogleMaps(adresse: string) {

      if (!adresse) {
        console.error('L\'adresse est invalide.');
        this.showToast('Aucune localisation disponible', 'warning');
        return;
      }
      this.utilsService.openInGoogleMaps(adresse);

   // if (!this.enseigne) return;
    
    // try {
    //   let query: string;
      
    //   if (this.enseigne.gpsLocation) {
    //     query = this.enseigne.gpsLocation;
    //   } else if (this.enseigne.adresse) {
    //     query = encodeURIComponent(this.enseigne.adresse);
    //   } else {
    //     this.showToast('Aucune localisation disponible', 'warning');
    //     return;
    //   }
      
    //   const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      
    //   if ((window as any).cordova?.InAppBrowser) {
    //     (window as any).cordova.InAppBrowser.open(url, '_system');
    //   } else {
    //     window.open(url, '_blank');
    //   }
    // } catch (error) {
    //   console.error('Erreur Google Maps:', error);
    //   this.handleError('Impossible d\'ouvrir la carte');
    // }
  }
  
  openPhoneCall(enseigne: any) {
    const phoneNumber = enseigne?.numeroTelephone;
    
    if (!phoneNumber || phoneNumber === '+000' || phoneNumber.trim() === '') {
      this.showToast('Aucun numéro valide disponible', 'warning');
      return;
    }
  
    console.log('Appel du numéro:', phoneNumber);  
  
    const url = `tel:${phoneNumber}`;
    
    try {
      if ((window as any).cordova?.InAppBrowser) {
        (window as any).cordova.InAppBrowser.open(url, '_system');
      } else {
        window.open(url, '_self');
      }
    } catch (error) {
      console.error('Erreur appel:', error);
      this.handleError('Appel impossible');
    }
  }
  
  async showHoraires() {
    if (!this.enseigne?.id) {
      this.showToast('Aucun horaire disponible', 'warning');
      return;
    }
  
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des horaires...',
      spinner: 'circles',
      duration: 5000 
    });
    await loading.present();
  
    this.enseigneService.getEnseigneHoraires(this.enseigne.id)
      .pipe(
        finalize(() => loading.dismiss())
      )
      .subscribe({
        next: (horaires: any) => {
          console.log('Horaires reçus:', horaires);
          
          this.enseigne.horaires = horaires;
          
          this.openHorairesModal();
        },
        error: (err: any) => {
          console.error('Erreur lors du chargement des horaires:', err);
          this.handleError('Impossible de charger les horaires');
        }
      });
  }

private async openHorairesModal() {
  const modal = await this.modalCtrl.create({
    component: HorairesModalComponent,
    componentProps: {
      enseigne: this.enseigne,
      horaires: this.enseigne.horaires
    },
    cssClass: 'horaires-modal',
    breakpoints: [0, 0.8],
    initialBreakpoint: 0.8
  });
  await modal.present();
}
  
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Restaurant': 'restaurant',
      'Bar': 'beer',
      'Café': 'cafe',
      'Fast Food': 'fast-food',
      'Boulangerie': 'pizza',
      'Hôtel': 'bed',
      'Boutique': 'bag',
      'Spa': 'fitness',
      'Coiffeur': 'cut'
    };
    return icons[category] || 'storefront';
  }
  
  formatPrixMoyen(prix: number): string {
    if (!prix) return 'Prix non disponible';
    if (prix <= 15) return '€ Économique';
    if (prix <= 35) return '€€ Moyen';
    return '€€€ Gastronomique';
  }
  
  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
  
  private async handleError(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
  
  navigateToEnseigneWebsite() {
    if (!this.enseigne?.website) {
      this.showToast('Site web non disponible', 'warning');
      return;
    }
    
    let url = this.enseigne.website;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    if ((window as any).cordova?.InAppBrowser) {
      (window as any).cordova.InAppBrowser.open(url, '_system');
    } else {
      window.open(url, '_blank');
    }
  }
  
  async reportIssue() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Signaler un problème',
      buttons: [
        { text: 'Informations incorrectes', handler: () => this.submitIssueReport('Informations incorrectes') },
        { text: 'Établissement fermé', handler: () => this.submitIssueReport('Établissement fermé') },
        { text: 'Photo inappropriée', handler: () => this.submitIssueReport('Photo inappropriée') },
        { text: 'Autre problème', handler: () => this.submitIssueReport('Autre problème') },
        { text: 'Annuler', role: 'cancel', icon: 'close' }
      ]
    });
    await actionSheet.present();
  }
  
  private submitIssueReport(issueType: string) {
    this.showToast('Signalement envoyé avec succès');
  }
}
    
