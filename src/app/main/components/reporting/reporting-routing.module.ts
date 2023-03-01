import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllActivityReportComponent } from './AllActivity-Report/AllActivity-Report.component';
import { ReportingComponent } from './components/reporting.component';
import { CreateReportComponent } from './create-report/create-report.component';
import { NASReportComponent } from './NAS-Report/NAS-Report.component';
import { NASSingleReportComponent } from './NASSingle-Report/NASSingle-Report.component';
import { ReportlistComponent } from './report-list/report-list.component';

const routes: Routes = [
  { path: '', component: ReportingComponent },
  { path: 'create-report', component: CreateReportComponent },
  { path: 'report-list', component: ReportlistComponent },
  { path: 'NAS-Report/:id', component: NASReportComponent },
  { path: 'NASSingle-Report/:id', component: NASSingleReportComponent },
  { path: 'AllActivity-Report/:id', component: AllActivityReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
