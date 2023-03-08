import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { EDRComponent } from './EDR/EDR.component';
import { FirewallBandwidthComponent } from './firewall-bandwidth/firewallBandwidth.component';
import { FirewallDurationComponent } from './firewall-duration/firewallDuration.component';
import { FirewallProtectionComponent } from './firewall-protection/firewallProtection.component';
import { FrameLinkComponent } from './frame-link/frame-link.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'firewall-bandwidth', component: FirewallBandwidthComponent },
  { path: 'firewall-duration', component: FirewallDurationComponent },
  { path: 'firewall-protection', component: FirewallProtectionComponent },
  { path: 'EDR', component: EDRComponent },
  { path: 'honeypot', component: FrameLinkComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
