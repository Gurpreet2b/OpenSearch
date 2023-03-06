import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportingRoutingModule } from './reportmail-routing.module';
import { ReportmailComponent } from './components/reportmail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { HighchartsChartModule } from 'highcharts-angular';
import { NASReportMailComponent } from './NAS-Report-mail/NAS-Report.component';
import { NASSingleReportMailComponent } from './NASSingle-Report-mail/NASSingle-Report.component';
import { AllActivityReportMailComponent } from './AllActivity-Report-mail/AllActivity-Report.component';
import { AllActivitySingleReportMailComponent } from './AllActivitySingle-Report-mail/AllActivitySingle-Report.component';
import { MailReportlistComponent } from '../reporting/mail-report-list/mail-report-list.component';

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
  declarations: [ReportmailComponent, NASReportMailComponent,
    NASSingleReportMailComponent, AllActivityReportMailComponent, AllActivitySingleReportMailComponent
  ],
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
