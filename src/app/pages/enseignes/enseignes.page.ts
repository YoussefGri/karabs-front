import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-enseignes',
  templateUrl: './enseignes.page.html',
  styleUrls: ['./enseignes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class EnseignesPage implements OnInit {
  categoryName: string = '';
  enseignes: any[] = [];
  showFilterOptions = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private modalController: ModalController) {}
  
  criteres = [
    { key: 'noteMoyenne', label: 'Note Moyenne' },
    { key: 'noteAmbiance', label: 'Ambiance' },
    { key: 'notePrix', label: 'Prix' },
  ];
  
  selectedCriteres: string[] = [];

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  getCritereLabel(key: string): string {
    const critere = this.criteres.find(c => c.key === key);
    return critere ? critere.label : '';
  }
  
  toggleCritere(critereKey: string) {
    const index = this.selectedCriteres.indexOf(critereKey);
    if (index > -1) {
      this.selectedCriteres.splice(index, 1);
    } else {
      this.selectedCriteres.push(critereKey);
    }
    this.sortEnseignes();
  }  
  
  sortEnseignes() {
    this.enseignes.sort((a, b) => {
      for (const critere of this.selectedCriteres) {
        if ((b[critere] ?? 0) !== (a[critere] ?? 0)) {
          return (b[critere] ?? 0) - (a[critere] ?? 0);
        }
      }
      return 0;
    });
  }
  
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }

  ngOnInit() {
    this.categoryName = this.route.snapshot.paramMap.get('nom') || '';
    this.http.get(`${environment.apiUrl}/api/enseignes/by-category/${this.categoryName}`)
      .subscribe((data: any) => {
        this.enseignes = data;
      });
  }
}