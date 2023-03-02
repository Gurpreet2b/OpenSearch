import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportmailComponent } from './components/reportmail.component';
import { NASReportMailComponent } from './NAS-Report-mail/NAS-Report.component';
import { NASSingleReportMailComponent } from './NASSingle-Report-mail/NASSingle-Report.component';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';

const routes: Routes = [
  { path: ':id', component: ReportmailComponent },
  { path: 'NASAll/:id', component: NASReportMailComponent },
  { path: 'NASSingle/:id', component: NASSingleReportMailComponent },
  { path: 'schedule-report/create', component: ScheduleReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
