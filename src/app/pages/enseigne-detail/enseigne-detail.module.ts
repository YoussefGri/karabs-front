import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EnseigneDetailPageRoutingModule } from './enseigne-detail-routing.module';

import { EnseigneDetailPage } from './enseigne-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnseigneDetailPageRoutingModule
  ],
  declarations: [EnseigneDetailPage]
})
export class EnseigneDetailPageModule {}
