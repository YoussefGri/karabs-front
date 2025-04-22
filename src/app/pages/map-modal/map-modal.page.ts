import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.page.html',
  styleUrls: ['./map-modal.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class MapModalPage {
  @Input() enseigne: {
    id: number;
    nom: string;
    noteMoyenne: number;
    photo: string | null;
    numeroTelephone: string | null;
    categories?: { id: number; nom: string }[] | null;
    lat: number | null;
    lng: number | null;
    adresse: string;
  } | undefined;

  constructor(private utilsService: UtilsService) {}
  openInGoogleMaps(adresse: string) {
    this.utilsService.openInGoogleMaps(adresse);
  }
  
  callNumber(numeroTelephone: any) {
    this.utilsService.callNumber(numeroTelephone);
  }
}
