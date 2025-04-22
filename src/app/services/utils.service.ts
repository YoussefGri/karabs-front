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
    // Si category est une string (ancien format), la convertir en objet
    const categoryName = typeof category === 'string' 
      ? category 
      : category?.nom?.toLowerCase() || 'default';

    switch (categoryName) {
      case 'manger':
        return {r: 224, g: 152, b: 57, a: 1};      
      case 'boire':
        return { r: 207, g: 102, b: 126, a: 1 };      
      case "s\'aérer":
        return { r:0, g: 167, b: 191, a: 1 };        
      case 'sortir':
        return { r: 105, g: 157, b: 80, a: 1 };       
      case 'travailler':
        return { r: 248, g: 232, b: 59, a: 1 };       
      case 'se cultiver':
        return { r: 110, g: 74, b: 131, a: 1 };       
      default:
        return { r: 255, g: 0, b: 0, a: 1 };      
    }
  }

  goToEnseigneDetail(number: number) {
    this.router.navigate(['/enseigne', number]);
  }
  
}
