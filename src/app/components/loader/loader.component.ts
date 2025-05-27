import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports : [CommonModule],
  template: `<div *ngIf="loading$ | async" class="loader-overlay"><div class="spinner"></div></div>`,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  loading$ = this.loaderService.loading$;

  constructor(private loaderService: LoaderService) {}
}
