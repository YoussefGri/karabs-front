import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CategorieService {
  // private apiUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  getCategories() {
    return this.http.get<any[]>(`${environment.apiUrl}/api/categories`);
  }

  getCategorieByNom(nom: string) {
    return this.http.get<any>(`${environment.apiUrl}/api/categorie/${nom}`);
  }

}
