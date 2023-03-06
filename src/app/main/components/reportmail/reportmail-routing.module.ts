import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllActivityReportMailComponent } from './AllActivity-Report-mail/AllActivity-Report.component';
import { AllActivitySingleReportMailComponent } from './AllActivitySingle-Report-mail/AllActivitySingle-Report.component';
import { ReportmailComponent } from './components/reportmail.component';
import { NASReportMailComponent } from './NAS-Report-mail/NAS-Report.component';
import { NASSingleReportMailComponent } from './NASSingle-Report-mail/NASSingle-Report.component';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';

const routes: Routes = [
  { path: ':id', component: ReportmailComponent },
  { path: 'NASAll/:id', component: NASReportMailComponent },
  { path: 'NASSingle/:id', component: NASSingleReportMailComponent },
  { path: 'AllActivity/:id', component: AllActivityReportMailComponent },
  { path: 'AllActivitySingle/:id', component: AllActivitySingleReportMailComponent },
  { path: 'schedule-report/create', component: ScheduleReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
