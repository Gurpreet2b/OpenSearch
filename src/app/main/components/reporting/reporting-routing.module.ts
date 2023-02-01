import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportingComponent } from './components/reporting.component';
import { CreateReportComponent } from './create-report/create-report.component';
import { ReportlistComponent } from './report-list/report-list.component';

const routes: Routes = [
  { path: '', component: ReportingComponent },
  { path: 'create-report', component: CreateReportComponent },
  { path: 'report-list', component: ReportlistComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
