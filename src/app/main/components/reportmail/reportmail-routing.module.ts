import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportmailComponent } from './components/reportmail.component';
import { ScheduleReportComponent } from './schedule-report/schedule-report.component';

const routes: Routes = [
  { path: ':id', component: ReportmailComponent },
  { path: 'schedule-report', component: ScheduleReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
