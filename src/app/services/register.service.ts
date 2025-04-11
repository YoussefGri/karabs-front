import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  ville: string;
  codePostal: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/register`, userData);
  }
}