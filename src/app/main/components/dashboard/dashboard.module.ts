import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { HighchartsChartModule } from 'highcharts-angular';
import { FirewallBandwidthComponent } from './firewall-bandwidth/firewallBandwidth.component';
import { FirewallDurationComponent } from './firewall-duration/firewallDuration.component';
import { FirewallProtectionComponent } from './firewall-protection/firewallProtection.component';
import { EDRComponent } from './EDR/EDR.component';

export function translateHttpLoaderFactory() {
}

@NgModule({
  declarations: [DashboardComponent, FirewallBandwidthComponent, 
    FirewallDurationComponent, FirewallProtectionComponent, EDRComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HighchartsChartModule
  ],
})
export class DashboardModule { }
