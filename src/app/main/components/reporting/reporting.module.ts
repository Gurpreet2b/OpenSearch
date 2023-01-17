import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportingRoutingModule } from './reporting-routing.module';
import { ReportingComponent } from './components/reporting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { HighchartsChartModule } from 'highcharts-angular';
import { ReportlistComponent } from './report-list/report-list.component';
// import { MatFormFieldModule } from '@angular/material/form-field';

export function translateHttpLoaderFactory() {
}

@NgModule({
  declarations: [ReportingComponent, ReportlistComponent],
  imports: [
    CommonModule,
    ReportingRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HighchartsChartModule,
    // MatFormFieldModule,
  ],
})
export class ReportingModule { }
