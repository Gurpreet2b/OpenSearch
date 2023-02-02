import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WindowAlertsRoutingModule } from './window-alerts-routing.module';
import { WindowAlertsComponent } from './components/window-alerts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { HighchartsChartModule } from 'highcharts-angular';

export function translateHttpLoaderFactory() {
}

@NgModule({
  declarations: [WindowAlertsComponent],
  imports: [
    CommonModule,
    WindowAlertsRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HighchartsChartModule
  ],
})
export class WindowAlertsModule { }
