import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UtilsService {
  constructor(private router: Router) {}

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // openInGoogleMaps(location: string) {
  //   const query = encodeURIComponent(location);
  //   window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  // }
  openInGoogleMaps(enseigne: any) {
    const query = encodeURIComponent(enseigne.gpsLocation || enseigne.adresse)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  goToExplore() {
    this.router.navigate(['/explore']);
  }

  callNumber(numeroTelephone: string) {
    if (!numeroTelephone) {
      console.error('Le numéro de téléphone est invalide.')
      return
    }
    const tel = numeroTelephone.replace(/\s+/g, '')
    window.open(`tel:${tel}`, '_system')
  }
}
