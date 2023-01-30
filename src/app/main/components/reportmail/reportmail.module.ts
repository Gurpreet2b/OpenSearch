import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportingRoutingModule } from './reportmail-routing.module';
import { ReportmailComponent } from './components/reportmail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { HighchartsChartModule } from 'highcharts-angular';

export function translateHttpLoaderFactory() {
}

@NgModule({
  declarations: [ReportmailComponent],
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
export class ReportMailModule { }
