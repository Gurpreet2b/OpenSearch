import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { LayoutComponent } from './components/layout.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [
      { path: '', redirectTo: 'dashboard' },
      { path: 'dashboard', loadChildren: () => import('../../../main/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'alerts', loadChildren: () => import('../../../main/components/window-alerts/window-alerts.module').then(m => m.WindowAlertsModule) },
      { path: 'reporting', loadChildren: () => import('../../../main/components/reporting/reporting.module').then(m => m.ReportingModule) },
      { path: 'rules', loadChildren: () => import('../../../main/components/rules/rules.module').then(m => m.RulesModule) },
    ],
    canActivate: [AuthGuard]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
