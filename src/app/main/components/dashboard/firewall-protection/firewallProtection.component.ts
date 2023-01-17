import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import HighchartsMore from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-firewallProtection',
  templateUrl: './firewallProtection.component.html',
  styleUrls: ['./firewallProtection.component.css']
})
export class FirewallProtectionComponent implements OnInit {

  highcharts = Highcharts;
  public TopBlockedPieChartData: any = {};
  public TopUserIpsAccessingBlockedContent: any = {};
  public TopApplicationAccessingBlockedContent: any = {};
  public TopCategoriesOfBlockedContent: any = {};
  public startDate: any = new Date();
  public endDate: any = new Date();
  public localSavedState: boolean = true;

  //ids of chart expand
  public topBlockedChartId: any;
  public topAccessingBlockedId: any;
  public topBlockedContentId: any;
  public topCategoryId: any;


  topPieChartData: any = [{
    name: 'Brands',
    colorByPoint: true,
    data: [{

      name: 'Objectionable',
      y: 1.53
    }, {
      name: 'Unproductivity',
      y: 1.40
    }, {
      name: 'Acceptable',
      y: 0.84
    }, {
      name: 'Unacceptable',
      y: 1.40
    }]
  }]


  constructor(private _http: HttpService,
    private router: Router,
    private dtPipe: DatePipe,
    private _auth: AuthService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Firewall-Protection`);
    this.chartProtection();
    this.topBlockedChartId = Highcharts.chart('topBlockedChartId', this.TopBlockedPieChartData)
    this.topAccessingBlockedId = Highcharts.chart('topAccessingBlockedId', this.TopUserIpsAccessingBlockedContent)
    this.topBlockedContentId = Highcharts.chart('topBlockedContentId', this.TopApplicationAccessingBlockedContent)
    this.topCategoryId = Highcharts.chart('topCategoryId', this.TopApplicationAccessingBlockedContent)
  }

  ngDoCheck(): void {
    // console.log('btn')
    if (this.authService.getSidebarState() == this.localSavedState) {
      return;
    }
    if (this.authService.getSidebarState()) {
      this.shrink();
    }
    else {
      this.expand();
    }
    this.localSavedState = !this.localSavedState;
  }

  shrink() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.6);
    this.topBlockedChartId.setSize(window.innerWidth / 4, undefined)
    this.topAccessingBlockedId.setSize(window.innerWidth / 4, undefined)
    this.topBlockedContentId.setSize(window.innerWidth / 4, undefined)
    this.topCategoryId.setSize(window.innerWidth / 4, undefined)
  }

  expand() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.3);
    this.topBlockedChartId.setSize(window.innerWidth /3.3, undefined)
    this.topAccessingBlockedId.setSize(window.innerWidth /3.3, undefined)
    this.topBlockedContentId.setSize(window.innerWidth /3.3, undefined)
    this.topCategoryId.setSize(window.innerWidth /3.3, undefined)
  }


  dateTimeFilter() {
    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
    console.log(request);
  }

  //trafic chart
  setPieChartData(widget: string, bytes: string = 'MB') {
    let TopApplicationsChartData = {
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'pie'
      },
      title: {
        text: 'Top Blocked Sites'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          },
          showInLegend: true
        }
      },
      credits: {
        enabled: false
      },
      series: this.topPieChartData

    }
    if (widget === 'top-blocked-chart') {
      this.TopBlockedPieChartData = TopApplicationsChartData;
    }
    if (widget === 'top-user-ips') {
      this.TopUserIpsAccessingBlockedContent = TopApplicationsChartData;
    }
    if (widget === 'top-user-ips') {
      this.TopApplicationAccessingBlockedContent = TopApplicationsChartData;
    }
    if (widget === 'top-user-ips') {
      this.TopCategoriesOfBlockedContent = TopApplicationsChartData;
    }
  }

  public chartProtection() {
    console.log('initializing charts');

    this.setPieChartData('top-blocked-chart', 'MB');
    this.TopBlockedPieChartData['series'] = this.topPieChartData;

    this.setPieChartData('top-user-ips', 'MB');
    this.TopUserIpsAccessingBlockedContent['series'] = this.topPieChartData;

    this.setPieChartData('top-user-ips', 'MB');
    this.TopApplicationAccessingBlockedContent['series'] = this.topPieChartData;

    this.setPieChartData('top-user-ips', 'MB');
    this.TopCategoriesOfBlockedContent['series'] = this.topPieChartData;
  }


}

