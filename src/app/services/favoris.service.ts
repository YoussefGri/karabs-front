import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'
import { Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class FavorisService {
  constructor(private http: HttpClient) {}

  getFavoris(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/favoris`)
  }

  removeFavori(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/favoris/remove/${id}`)
  }
}
