import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

import { timeout, retry, tap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
interface Ratings {
  prix: number;
  qualite: number;
  ambiance: number;

}
@Injectable({
  providedIn: 'root'
})
export class EnseignesService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private authService: AuthService) {}


  getEnseignesByCategory(name: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/enseignes/by-category/${name}`);
  }

  getAllEnseignes(): Observable<any> {
    console.log('Tentative de récupération des enseignes depuis:', `${this.apiUrl}/enseignes`);
    return this.http.get(`${this.apiUrl}/enseignes`).pipe(
      tap(response => console.log('Réponse du serveur:', response)),
      catchError(error => {
        console.error('Erreur API:', error);
        return throwError(error);
      })
    );
  }
  
  
  getEnseigneHoraires(id: number): Observable<any[]> {
    return of(this.authService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Token non disponible'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<{ horaires: any[] }>(
          `${this.apiUrl}/enseignes/${id}/horaires`,
          { headers }
        ).pipe(
          tap(resp => console.log('Réponse horaires brute :', resp)),
          map(resp => {
            if (resp && resp.horaires && Array.isArray(resp.horaires)) {
              return resp.horaires;
            }
            return [];
          }),
          catchError(err => {
            console.error('Erreur horaires:', err);
            return of([
              { jour: 'LUNDI', heures: { ouverture: '09:00', fermeture: '18:00' } },
              { jour: 'MARDI', heures: { ouverture: '09:00', fermeture: '18:00' } },
              { jour: 'MERCREDI', heures: { ouverture: '09:00', fermeture: '18:00' } },
              { jour: 'JEUDI', heures: { ouverture: '09:00', fermeture: '18:00' } },
              { jour: 'VENDREDI', heures: { ouverture: '09:00', fermeture: '18:00' } },
              { jour: 'SAMEDI', heures: { ouverture: '10:00', fermeture: '17:00' } },
              { jour: 'DIMANCHE', heures: { ouverture: '10:00', fermeture: '15:00' } }
            ]);
          })
        );
      }),
      catchError(err => {
        console.error('Erreur d\'authentification:', err);
        return of([]);
      })
    );
  }
  getRandomEnseignes(count: number): Observable<any[]> {
    const url = `${this.apiUrl}/enseignes/random/${count}`;
    console.log(`Fetching ${count} random enseignes from: ${url}`);
  
    return this.http.get<{enseignes: any[]}>(url).pipe(
      timeout(10000),
      retry(2),
      map(response => {
        if (!response?.enseignes) {
          throw new Error('Réponse invalide du serveur');
        }
        
        return response.enseignes.map((e: any) => ({
          id: e.id,
          nom: e.nom,
          description: e.description,
          photo: e.photo || 'assets/default.jpg',
          noteMoyenne: e.noteMoyenne || 0,
          categorie: e.categorie || 'Non classé',
          slogan: e.slogan || 'Slogan par défaut'
        }));
      }),
      catchError(error => {
        console.error('Error fetching random enseignes:', error);
        return of(Array(count).fill(0).map((_, i) => ({
          id: i + 1,
          nom: `Enseigne de secours ${i + 1}`,
          description: "Description par défaut",
          photo: "assets/default-enseigne.jpg",
          noteMoyenne: 3.5,
          categorie: "Divers"
        })));
      })
    );
  }

  getEnseigneById(id: number): Observable<any> {
    return of(this.authService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.error('Aucun token JWT trouvé');
          return throwError(() => new Error('Authentification requise'));
        }
  
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.apiUrl}/enseignes/${id}`, { headers });
      }),
      catchError(error => {
        console.error('Erreur:', error);
        return throwError(() => error);
      })
    );
  }


  // Pour la méthode rateEnseigne dans enseignes.service.ts
rateEnseigne(id: number, ratings: Ratings): Observable<any> {
  return of(this.authService.getToken()).pipe(
    switchMap(token => {
      if (!token) {
        return throwError(() => new Error('Utilisateur non authentifié'));
      }
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      
      console.log('Envoi des notations:', ratings);
      
      // Vérification des données à envoyer
      if (!ratings.prix || !ratings.qualite || !ratings.ambiance) {
        console.warn('Attention: Valeurs de notation incomplètes', ratings);
      }
      
      return this.http.post(`${this.apiUrl}/enseignes/${id}/rate`, ratings, { 
        headers,
        observe: 'response'  // Pour capturer la réponse complète avec les headers
      }).pipe(
        tap(response => {
          console.log('Réponse brute du serveur:', response);
          console.log('Statut HTTP:', response.status);
          console.log('Corps de la réponse:', response.body);
        }),
        map(response => {
          // S'assurer que le body contient les données attendues
  const body = (response.body || {}) as any;
          
          // Vérifier si les données essentielles sont présentes
          if (!body.notePrix && !body.noteQualite && !body.noteAmbiance && !body.noteACM) {
            console.warn('La réponse ne contient pas les notes attendues');
          }
          
          return body;
        })
      );
    }),
    catchError(error => {
      console.error('Erreur lors de l\'envoi des notations:', error);
      
      // Log détaillé de l'erreur
      if (error.error) {
        console.error('Détail de l\'erreur:', error.error);
      }
      if (error.status) {
        console.error('Status code:', error.status);
      }
      
      return throwError(() => error);
    })
  );
  }



  addFavori(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favoris/add`, { enseigneId: id });
  }

  removeFavori(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favoris/remove/${id}`);
  }
}
