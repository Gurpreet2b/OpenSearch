import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportmailComponent } from './components/reportmail.component';
import { NASReportMailComponent } from './NAS-Report-mail/NAS-Report.component';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';

const routes: Routes = [
  { path: ':id', component: ReportmailComponent },
  { path: 'NASAll/:id', component: NASReportMailComponent },
  { path: 'schedule-report/create', component: ScheduleReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
