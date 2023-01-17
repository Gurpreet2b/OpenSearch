import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import HighchartsMore from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-firewallDuration',
  templateUrl: './firewallDuration.component.html',
  styleUrls: ['./firewallDuration.component.css']
})
export class FirewallDurationComponent implements OnInit {

  highcharts = Highcharts;
  public FWTopSitesPieChartData: any = {};
  public TopUserIpsBarChartData: any = {};
  public TopApplicationsChartData: any = {};
  public startDate: any = new Date();;
  public endDate: any = new Date();
  public localSavedState: boolean = true;

  //ids of chart expand
  public topApplicationId2: any;
  public fwTopSitesId2: any;
  public topUsersId2: any;

  topColumnChartData: any =   [{
    name: 'Year 1990',
    data: [5000, 727, 502, 721, 26]
  }, {
    name: 'Year 2000',
    data: [814, 841, 3714, 726, 31]
  }, {
    name: 'Year 2010',
    data: [1044, 944, 4170, 735, 40]
  }, {
    name: 'Year 2018',
    data: [1276, 1007, 4561, 746, 42]
  }]

  topBarChartData: any =  [{
    name: 'Year 2000',
    data: [814, 841, 3714, 726, 31]
  }, {
    name: 'Year 1990',
    data: [631, 727, 3202, 721, 26]
  }, {
    name: 'Year 2018',
    data: [1276, 1007, 4561, 746, 42]
  }]


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
    this.authService.SetHeaderTitleName(`Firewall-Duration`);
    this.chartDuration();
    this.topApplicationId2 = Highcharts.chart('topApplicationId2', this.TopApplicationsChartData)
    this.fwTopSitesId2 = Highcharts.chart('fwTopSitesId2', this.FWTopSitesPieChartData)
    this.topUsersId2 = Highcharts.chart('topUsersId2', this.TopUserIpsBarChartData)
  }

  ngDoCheck(): void {
    // console.log('btn')
    if(this.authService.getSidebarState() == this.localSavedState){
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

  shrink(){
    console.log(window.innerWidth);
    console.log(window.innerWidth/1.6);
    this.topApplicationId2.setSize(window.innerWidth/2, undefined)
    this.fwTopSitesId2.setSize(window.innerWidth/4, undefined)
    this.topUsersId2.setSize(window.innerWidth/2, undefined)
  }
  
  expand(){
    console.log(window.innerWidth);
    console.log(window.innerWidth/1.3);
    this.topApplicationId2.setSize(window.innerWidth/1.7, undefined)
    this.fwTopSitesId2.setSize(window.innerWidth/3.3, undefined)
    this.topUsersId2.setSize(window.innerWidth/1.7, undefined)
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
        text: 'FW Top Sites'
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
    if (widget === 'top-fw-sites') {
      this.FWTopSitesPieChartData = TopApplicationsChartData;
    }
  }

  
  setBarChartData(widget: string, bytes: string = 'MB') {
    let TopApplicationsBarChartData = {
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'bar'
      },
      title: {
        text: 'Top Users IPs'
      },
      xAxis: {
        title: {
          text: null
        }
      },
      yAxis: {
      },
      tooltip: {
        valueSuffix: ' millions'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },

      credits: {
        enabled: false
      },
      series: this.topBarChartData

    }
    if (widget === 'top-applications') {
      this.TopUserIpsBarChartData = TopApplicationsBarChartData;
    }
  }

  topColumnChartDataApplication(widget: string, bytes: string = 'MB') {
    let TopApplicationsColumnChartData = {
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'column'
      },
      title: {
        text: 'Top Applications'
      },
      xAxis: {
        title: {
          text: null
        }
      },
      yAxis: {
      },
      tooltip: {
        valueSuffix: ' millions'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },

      credits: {
        enabled: false
      },
      series: this.topBarChartData

    }
    if (widget === 'top-applications-data') {
      this.TopApplicationsChartData = TopApplicationsColumnChartData;
    }
  }


  public chartDuration() {
    console.log('initializing charts');

    this.setPieChartData('top-fw-sites', 'MB');
    this.FWTopSitesPieChartData['series'] = this.topPieChartData;

    this.setBarChartData('top-applications', 'MB');
    this.TopUserIpsBarChartData['series'] = this.topBarChartData;

    this.topColumnChartDataApplication('top-applications-data', 'MB');
    this.TopApplicationsChartData['series'] = this.topColumnChartData;
  }


}

