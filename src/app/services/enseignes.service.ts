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

  rateEnseigne(enseigneId: number, category: string, rating: number): Observable<any> {
    return of(this.authService.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Token non disponible'));
        }
        
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post(`${this.apiUrl}/enseignes/${enseigneId}/rate`, 
          { category, rating }, 
          { headers }
        ).pipe(
          catchError(error => {
            console.error('Erreur lors de la notation:', error);
            return throwError(() => error);
          })
        );
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
