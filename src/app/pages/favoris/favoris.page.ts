import { Component, OnInit } from '@angular/core';
import { FavorisService } from 'src/app/services/favoris.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-favoris',
  templateUrl: './favoris.page.html',
  styleUrls: ['../enseignes/enseignes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class FavorisPage implements OnInit {
  favoris: any[] = [];

  constructor(private favorisService: FavorisService, private utils: UtilsService) {}

  ngOnInit() {
    this.favorisService.getFavoris().subscribe(data => this.favoris = data);
  }

  removeFromFavoris(id: number) {
    this.favorisService.removeFavori(id).subscribe({
      next: () => this.favoris = this.favoris.filter(e => e.id !== id),
      error: err => console.error('Erreur suppression favori', err)
    });
  }

  openInGoogleMaps(enseigne: any) {
    this.utils.openInGoogleMaps(enseigne.gpsLocation || enseigne.adresse);
  }

  goToExplore() {
    this.utils.goToExplore();
  }
}
