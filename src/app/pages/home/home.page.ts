import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false
})
export class HomePage implements OnInit {
  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Souscrire aux informations de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  // Naviguer vers le profil
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Déconnecter l'utilisateur
  logout(): void {
    this.authService.logout();
  }
}