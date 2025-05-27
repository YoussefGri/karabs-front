import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';


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

  async openInGoogleMaps(adresse: string) {
    if (!adresse?.trim()) {
      console.error('Adresse invalide');
      return;
    }
  
    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${
        encodeURIComponent(adresse.trim())
      }`;
      
      await Browser.open({ url });
    } catch (error) {
      console.error('Erreur Google Maps:', error);
      return;
      // Fallback pour les plateformes non supportées
      //window.open(url, '_blank');
    }
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

  getCategoryColor(category?: any): { r: number, g: number, b: number, a: number } {
    const hex = typeof category === 'string'
      ? undefined
      : category?.couleur || '#FF0000'; // fallback rouge
  
    return this.hexToRgba(hex);
  }
  
  hexToRgba(hex: string, alpha = 1): { r: number; g: number; b: number; a: number } {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
  
    if (sanitized.length === 6) {
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b, a: alpha };
    }
  
    // fallback si hex invalide
    return { r: 255, g: 0, b: 0, a: alpha };
  }
  

  goToEnseigneDetail(number: number) {
    this.router.navigate(['/enseigne', number]);
  }
  
  getStarIcon(note: number, position: number): string {
    const diff = note - (position - 1);

    if (diff >= 0.8) return 'star';       
    if (diff >= 0.3) return 'star-half';  
    return 'star-outline';                
  }
}
