import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportmailComponent } from './components/reportmail.component';

const routes: Routes = [
  { path: ':id', component: ReportmailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
