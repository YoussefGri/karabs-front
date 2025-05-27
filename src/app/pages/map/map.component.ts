import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { IonHeader, IonContent } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [CommonModule, IonicModule, RouterModule],
  standalone: true,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(30px)' }))
      ])
    ])
  ]
})

export class MapComponent implements OnInit {
  map!: L.Map; 
  selectedEnseigne: any = null;
  showOverlay = false;

  iconMap: { [key: string]: L.Icon } = {};

  constructor(private http: HttpClient, private utilsService: UtilsService) {}

  ngOnInit() {
    this.initMap();
    //this.initIcons();
    this.loadMarkers();
    this.addGeolocateButton();
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  initMap() {
    this.map = L.map('mapId').setView([43.6119, 3.8777], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    this.map.on('click', () => {
      this.showOverlay = false;
    });
  }

  // initIcons() {
  //   const categories = ['manger', 'boire', 'sortir', 'sarer', 'travailler', 'secultiver'];
  //   categories.forEach(cat => {
  //     this.iconMap[cat] = this.makeIcon(`assets/markers/marker-${cat}.png`);
  //   });
  //   this.iconMap['default'] = this.makeIcon('assets/markers/marker-default.png');
  // }

  makeIcon(iconUrl: string): L.Icon {
    return L.icon({
      iconUrl,
      iconSize: [30, 30],
      iconAnchor: [12, 41],
      popupAnchor: [0, -30],
      shadowSize: [41, 41],
    });
  }

  loadMarkers() {
    this.http.get<any[]>('http://localhost:8000/api/map').subscribe(enseignes => {
      enseignes.forEach(e => {
        console.log('Enseigne:', e);
        const category = e.categories?.[0];
        const color = category?.couleur || '#FF0000';
    
        const icon = this.makeColoredIcon(color);
    
        const marker = L.marker([e.lat, e.lng], { icon }).addTo(this.map);
        marker.on('click', () => {
          if (this.selectedEnseigne && this.selectedEnseigne.id === e.id) {
            this.showOverlay = !this.showOverlay;
          } else {
            this.selectedEnseigne = e;
            this.showOverlay = true;
          }
        });
    
        marker.bindPopup(`
          <strong>${e.nom}</strong><br>
          ${e.adresse}<br>
          <em>Note : ${e.noteMoyenne ?? '–'}/5</em>
        `);
      });
    });
    
  }

  makeColoredIcon(hexColor: string): L.Icon {
    const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
        <path fill="${hexColor}" d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/>
      </svg>
    `);
  
    const iconUrl = `data:image/svg+xml;charset=UTF-8,${svg}`;
  
    return L.icon({
      iconUrl,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      shadowSize: [41, 41]
    });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = './assets/travailler.jpg'; // image de secours
  }
  
  
  

//   loadMarkers() {
//     this.http.get<any[]>('http://localhost:8000/api/map').subscribe(enseignes => {
//       enseignes.forEach(e => {
//         const rawCat = e.categories?.[0]?.nom;
// const catName = this.normalizeCategory(rawCat);
// console.log('Catégorie brute :', rawCat, '→ clé utilisée :', catName);
//         const icon = this.iconMap[catName] || this.iconMap['default'];

//         const marker = L.marker([e.lat, e.lng], { icon }).addTo(this.map);
//         marker.on('click', () => {
//           if (this.selectedEnseigne && this.selectedEnseigne.id === e.id) {
//             this.showOverlay = !this.showOverlay;
//           } else {
//             this.selectedEnseigne = e;
//             this.showOverlay = true;
//           }
//         });

//         marker.bindPopup(`
//           <strong>${e.nom}</strong><br>
//           ${e.adresse}<br>
//           <em>Note : ${e.noteMoyenne ?? '–'}/5</em>
//         `);
//       });
//     });
//   }

  addGeolocateButton() {
    const CustomControl = L.Control.extend({
      options: {
        position: 'topright'
      },

      onAdd: (map: L.Map) => {
        const container = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.innerHTML = '📍';
        container.title = 'Me localiser';
        container.style.width = '36px';
        container.style.height = '36px';
        container.style.backgroundColor = 'white';
        container.style.cursor = 'pointer';

        L.DomEvent.on(container, 'click', () => {
          map.locate({ setView: true, maxZoom: 14 });
        });

        return container;
      }
    });

    this.map.addControl(new CustomControl());
  }

  call(num: string) {
    window.open(`tel:${num}`, '_system');
  }

  goTo(enseigne: any) {
    const { lat, lng } = enseigne;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  }
  normalizeCategory(nom: string = ''): string {
    return nom
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // retire les espaces, apostrophes, etc.
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // supprime les accents
  }

  getStarIcon(note: number, position: number): string {

    return this.utilsService.getStarIcon(note, position);             
  }
  
}