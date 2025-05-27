import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnseigneDetailPage } from './enseigne-detail.page';

const routes: Routes = [
  {
    path: '',
    component: EnseigneDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnseigneDetailPageRoutingModule {}
