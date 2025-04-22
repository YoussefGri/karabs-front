import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular';
import { MapModalPage } from '../map-modal/map-modal.page';
import { HttpClient } from '@angular/common/http';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapPage {
  @ViewChild('map') mapRef!: ElementRef;
  map!: GoogleMap;
  private markerDataMap: Map<string, any> = new Map();
  enseignes: any[] = [];

  constructor(private modalCtrl: ModalController, private http: HttpClient, private utilsService: UtilsService) {}

//   private getMarkerColor(category?: any): { r: number, g: number, b: number, a: number } {    
//     // Si category est une string (ancien format), la convertir en objet
//     const categoryName = typeof category === 'string' 
//       ? category 
//       : category?.nom?.toLowerCase() || 'default';

//     switch (categoryName) {
//       case 'manger':
//         return { r: 224, g: 152, b: 57, a: 0.8 };       // Orange
//       case 'travailler':
//         return { r: 207, g: 102, b: 126, a: 0.8 };      // Rose bordeaux
//       case "s'aérer":
//         return { r: 105, g: 157, b: 80, a: 0.8 };       // Vert
//       case 'sortir':
//         return { r: 0, g: 167, b: 191, a: 0.8 };        // Bleu cyan
//       case 'se cultiver':
//         return { r: 248, g: 232, b: 59, a: 0.8 };       // Jaune vif
//       case 'boire':
//         return { r: 110, g: 74, b: 131, a: 0.8 };       // Violet
//       default:
//         return { r: 128, g: 128, b: 128, a: 0.5 };      // Gris par défaut
//     }
// }
    
  ionViewDidEnter() {
    this.createMap();
  }

  async createMap() {
    this.map = await GoogleMap.create({
      id: 'karabs-map',
      apiKey: environment.mapsKey,
      element: this.mapRef.nativeElement,
      forceCreate: true,
      config: {
        center: {
          lat: 48.8566,
          lng: 2.3522,
        },
        zoom: 8,
      },
    });
    this.loadMarkers();
  }



  loadMarkers() {
    this.http.get<any[]>(`${environment.apiUrl}/api/map`).subscribe(async (data) => {
      this.enseignes = data;
  
      const markers = data.map((e) => {
      const markerId = e.id.toString();
      this.markerDataMap.set(markerId, e);

      //const markerColor = this.getMarkerColor(e.categories?.[0]);
      const markerColor = this.utilsService.getCategoryColor(e.categories?.[0]);

        
        return {
          coordinate: {
            lat: e.lat,
            lng: e.lng,
          },
          snippet: `Note: ${e.noteMoyenne ?? 'N/A'}`,
          markerId: markerId,
          tintColor: markerColor,
        };
      });
  
      await this.map.addMarkers(markers);
  
      await this.map.setOnMarkerClickListener(async (marker) => {
        const enseigneData = this.markerDataMap.get(marker.markerId);
        
        if (enseigneData) {
          const modal = await this.modalCtrl.create({
            component: MapModalPage,
            componentProps: {
              enseigne: {
                id: enseigneData.id,
                nom: enseigneData.nom,
                noteMoyenne: enseigneData.noteMoyenne,
                photo: enseigneData.photo,
                categories: enseigneData.categories,
                numeroTelephone: enseigneData.numeroTelephone,
                lat: enseigneData.lat,
                lng: enseigneData.lng,
                adresse : enseigneData.adresse
              }
            },
            breakpoints: [0, 0.7],
            initialBreakpoint: 0.5,
          });
          
          await modal.present();
        }
      });
    });
  }
}
