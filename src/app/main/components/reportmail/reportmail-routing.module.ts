import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllActivityReportMailComponent } from './AllActivity-Report-mail/AllActivity-Report.component';
import { AllActivitySingleReportMailComponent } from './AllActivitySingle-Report-mail/AllActivitySingle-Report.component';
import { ReportmailComponent } from './components/reportmail.component';
import { NASReportMailComponent } from './NAS-Report-mail/NAS-Report.component';
import { NASSingleReportMailComponent } from './NASSingle-Report-mail/NASSingle-Report.component';

const routes: Routes = [
  { path: 'all/IU:id', component: ReportmailComponent },
  { path: 'all/NAS/:id', component: NASReportMailComponent },
  { path: 'single/NAS/:id', component: NASSingleReportMailComponent },
  { path: 'all/AA/:id', component: AllActivityReportMailComponent },
  { path: 'single/AA/:id', component: AllActivitySingleReportMailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
