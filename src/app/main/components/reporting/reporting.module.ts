import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportingRoutingModule } from './reporting-routing.module';
import { ReportingComponent } from './components/reporting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { HighchartsChartModule } from 'highcharts-angular';
import { ReportlistComponent } from './report-list/report-list.component';
import { CreateReportComponent } from './create-report/create-report.component';
// import { timeChangeFormatPipe } from '../date-pipe';
// import { MatFormFieldModule } from '@angular/material/form-field';
import { Pipe, PipeTransform } from '@angular/core';
import { NASReportComponent } from './NAS-Report/NAS-Report.component';
import { NASSingleReportComponent } from './NASSingle-Report/NASSingle-Report.component';
import { AllActivityReportComponent } from './AllActivity-Report/AllActivity-Report.component';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({ name: 'timeFormat' })
export class timeChangeFormatPipe implements PipeTransform {
  transform(seconds: number): string {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    var seconds = seconds - (hours * 3600) - (minutes * 60);

    var time = "";
    if (hours != 0) {
      time = hours + ":";
    }
    time += minutes + ":";
    if (seconds < 10) { time += "0"; }
    time += seconds;
    return time;

  }
}

export function translateHttpLoaderFactory() {
}

@NgModule({
  declarations: [ReportingComponent, CreateReportComponent, ReportlistComponent, timeChangeFormatPipe, NASReportComponent, NASSingleReportComponent, AllActivityReportComponent],
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
