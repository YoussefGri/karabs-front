import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-horaires-modal',
  templateUrl: './horaires-modal.component.html',
  styleUrls: ['./horaires-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HorairesModalComponent implements OnInit {
  @Input() enseigne: any;
  @Input() horaires: any;

  horairesList: { jour: string, heures: string }[] = [];
  aDesHoraires = false;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.formatHoraires();
  }

  private formatHoraires() {
    const joursOrdre = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];

    // Initialisation avec "Fermé"
    this.horairesList = joursOrdre.map(jour => ({
      jour: this.translateJour(jour),
      heures: 'Fermé'
    }));

    const horairesData = this.enseigne?.horaires || this.horaires;
    const horairesByDay = new Map<string, string[]>();

    if (horairesData && Array.isArray(horairesData)) {
      horairesData.forEach((h: any) => {
        const jour = (typeof h.jour === 'string' ? h.jour.toUpperCase() : '');
        const index = joursOrdre.indexOf(jour);

        if (index > -1 && h.heures?.ouverture && h.heures?.fermeture) {
          const debut = this.formatHeure(h.heures.ouverture);
          const fin = this.formatHeure(h.heures.fermeture);

          if (!horairesByDay.has(jour)) {
            horairesByDay.set(jour, []);
          }
          horairesByDay.get(jour)!.push(`${debut} - ${fin}`);
        }
      });

      joursOrdre.forEach((jour, index) => {
        const horairesJour = horairesByDay.get(jour);
        if (horairesJour && horairesJour.length > 0) {
          this.horairesList[index].heures = horairesJour.join(', ');
          this.aDesHoraires = true;
        }
      });
    }
  }

  private translateJour(jour: string): string {
    const translations: { [key: string]: string } = {
      'LUNDI': 'Lundi',
      'MARDI': 'Mardi',
      'MERCREDI': 'Mercredi',
      'JEUDI': 'Jeudi',
      'VENDREDI': 'Vendredi',
      'SAMEDI': 'Samedi',
      'DIMANCHE': 'Dimanche'
    };
    return translations[jour] || jour;
  }

  private formatHeure(heure: string): string {
    if (!heure) return '';
    const [h, m] = heure.split(':');
    return `${h}h${m !== '00' ? m : ''}`;
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}