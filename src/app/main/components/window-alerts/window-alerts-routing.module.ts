import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WindowAlertsComponent } from './components/window-alerts.component';

const routes: Routes = [
  { path: '', component: WindowAlertsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WindowAlertsRoutingModule { }
