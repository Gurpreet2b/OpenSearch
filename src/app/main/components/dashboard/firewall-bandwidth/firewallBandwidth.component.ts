import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
// import Highcharts  from 'highcharts';
import { AuthService, HttpService } from 'src/app/core/services';
// import domToPdf from 'dom-to-pdf';
import HighchartsMore from 'highcharts/highcharts-more';
// import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
// HighchartsMore(Highcharts);
// HighchartsSolidGauge(Highcharts);
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-firewallBandwidth',
  templateUrl: './firewallBandwidth.component.html',
  styleUrls: ['./firewallBandwidth.component.css']
})
export class FirewallBandwidthComponent implements OnInit {
  public loading = false;
  // Highcharts: typeof Highcharts = Highcharts;
  highcharts = Highcharts;
  public multidatachart: any = {};
  public BandwidthOverTimeChart: any = {};
  public TrafficActionsOverTime: any = {};
  public TopApplications: any = {};
  public TopApplicationsBarChartData: any = {};
  public TopUsersIpsBar: any = {};
  public TopTrafficCategoriesPieChart: any = {};
  public TopSitesColumnChart: any = {};
  public startDate: any = new Date();
  public endDate: any = new Date();
  public localSavedState: boolean = true;

 //ids of chart expand
  public topApplicationId: any;
  public topUsersIpBarId: any;
  public topTrafficCategoryId: any;
  public topSitesColumnChartId: any;

  //chart Data
  public topApplicationPieChartData: any;
  public toptrafficCategoriesChartData: any;
  public topUsersIpBarChartData: any;
  public topsitesColumnChartData: any;

  //table data
  public topDownloadTableData: any;

  topColumnChartData: any = [{
    name: 'Year 1990',
    data: [631, 727, 3202, 721, 26]
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

  topBarChartData: any = [{
    name: 'Year 1990',
    data: [631, 727, 3202, 721, 26]
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

  traffic: any = [{
    type: 'area',
    name: 'USD to EUR',
    data: [0.6, 0.7, 0.8, 1]
  }]

  constructor(private _http: HttpService,
    private router: Router,
    private dtPipe: DatePipe,
    private _auth: AuthService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Firewall-Bandwidth`);
    this.startDate = this.dtPipe.transform(
      '2022-10-24T10:00',
      'yyyy-MM-ddTHH:mm'
    );
    this.endDate = this.dtPipe.transform(
      '2022-10-24T10:11',
      'yyyy-MM-ddTHH:mm'
    );
    this.overviewBandwidthDashboard();
   
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
    this.topApplicationId.setSize(window.innerWidth/4, undefined)
    this.topUsersIpBarId.setSize(window.innerWidth/2, undefined)
    this.topTrafficCategoryId.setSize(window.innerWidth/4, undefined)
    this.topSitesColumnChartId.setSize(window.innerWidth/2, undefined)
  }

  expand(){
    console.log(window.innerWidth);
    console.log(window.innerWidth/1.3);
    this.topApplicationId.setSize(window.innerWidth/3.3, undefined)
    this.topUsersIpBarId.setSize(window.innerWidth/1.7, undefined)
    this.topTrafficCategoryId.setSize(window.innerWidth/3.3, undefined)
    this.topSitesColumnChartId.setSize(window.innerWidth/1.7, undefined)
  }
  
  dateTimeFilter() {
    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
    console.log(request);
  }

  overviewBandwidthDashboard() {
    if (
      new Date(this.startDate).getTime() >=
      new Date(this.endDate).getTime()
    ) {
      alert(
        'The Starting Date-Time should be greater than the ending Date-Time. Please Use Appropriate Data and Time Values'
      );
      return;
    }
    if (
      new Date(this.endDate).getTime() -
      new Date(this.startDate).getTime() <
      300000
    ) {
      alert(
        'The difference in Starting and Ending time must be atleast 10 minutes'
      );
      return;
    }
    this.loading = true;
    
    let request: any = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),

    };

    this._http.post('eql/bandwidth', request).subscribe(
      async (res) => {
        if (res.status) {
          alert('Success');
          console.log(res)
      
          this.topApplicationPieChartData = res.data.TopApplications;
          this.toptrafficCategoriesChartData = res.data.TopCategories;
          this.topUsersIpBarChartData = res.data.TopUsers;
          this.topsitesColumnChartData = res.data.TopSites;
          // this.topDownloadTableData = res.data.
          this.chartBandwidth();
         
          this.createBandwidthCharts()
        } else {
          this.loading = false;
          alert('something is wrong');
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          this.loading = false;
          // alert(error.error.error);
        } else {
          this.loading = false;
          alert(error.error.error);
        }
      }
    );
  }


  //trafic chart
  setPieChartApplications(widget: string, bytes: string = 'MB') {
    let TopApplicationsChartData = {
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'pie'
      },
      title: {
        text: 'Top Applications'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
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
      // series: this.topPieChartData
      series: []

    }
    if (widget === 'top-applications') {
      this.TopApplications = TopApplicationsChartData;
    }
    if (widget === 'top-traffic-applications') {
      this.TopTrafficCategoriesPieChart = TopApplicationsChartData;
    }
  }

  setBarChartApplications(widget: string, bytes: string = 'MB') {
    // let TopApplicationsBarChartData = {
    //   chart: {
    //     zoomType: 'x',
    //     backgroundColor: 'snow',
    //     type: 'bar'
    //   },
    //   title: {
    //     text: 'Top Users IPs'
    //   },
    //   xAxis: {
    //     title: {
    //       text: null
    //     }
    //   },ltip: {
    //     valueSuffix: ' millions'
    //   },
    //   plotOptions: {
    //     bar: {
    //       dataLabels: {
    //         enabled: true
    //       }
    //     }
    //   },

    //   credits: {
    //     enabled: false
    //   },
    //   // series: this.topBarChartData
    //   series : []

    // }
    let TopApplicationsBarChartData = {
      chart: {
        type: 'bar',
        backgroundColor: 'snow',
        // events: {
        //   redraw: (chart: any) => {
        //     console.log('bar callback event');
        //     console.log(chart);
        //     let categoryHeight = 20;
        //     chart.update({
        //       chart: {
        //         height:
        //           categoryHeight * chart.pointCount +
        //           (chart.chartHeight - chart.plotHeight),
        //       },
        //     });
        //     // chart.target.callback(this);
        //   },
        // },
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: [],

        title: {
          text: null,
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Bandwidth',
          align: 'high',
        },
        labels: {
          overflow: 'justify',
        },
      },
      tooltip: {
        valueSuffix: ' MB',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            // groupPadding: 0,
            // pointPadding: 0,
            enabled: false,
          },
          // maxPointWidth: 30,
        },
        series: {
          pointWidth: 20,
        },
      },
      // legend: {
      //   layout: 'vertical',
      //   align: 'right',
      //   verticalAlign: 'top',
      //   x: -40,
      //   y: 80,
      //   floating: true,
      //   borderWidth: 1,
      //   backgroundColor: '#FFFFFF',
      //   shadow: true,
      // },
      credits: {
        enabled: false,
      },
      series: [],
    };
    if (widget === 'top-bar-chart') {
      this.TopUsersIpsBar = TopApplicationsBarChartData;
    }
  }

  setColumnChartApplications(widget: string, bytes: string = 'MB') {
    let TopApplicationsColumnChartData = {
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'column'
      },
      title: {
        text: 'Top Sites'
      },
      xAxis: {
        title: {
          text: null
        }
      },
      yAxis: {

      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: false
          }
        }
      },

      credits: {
        enabled: false
      },
      // series: this.topColumnChartData
      series: []
    }
    if (widget === 'top-sites-applications') {
      this.TopSitesColumnChart = TopApplicationsColumnChartData;
    }
  }


  public chartBandwidth() {
    console.log('initializing charts');

    this.setPieChartApplications('top-applications', 'MB');
    this.TopApplications['series'] = this.topApplicationPieChartData.chart.Series;
    // this.TopTrafficCategoriesPieChart['series'] = this.topPieChartData;

    this.setPieChartApplications('top-traffic-applications', 'MB');
    this.TopTrafficCategoriesPieChart['series'] = this.toptrafficCategoriesChartData.chart.Series;

    this.setBarChartApplications('top-bar-chart', 'MB');
    this.TopUsersIpsBar['xAxis']['categories'] = this.topUsersIpBarChartData.Labels;
    this.TopUsersIpsBar['series'] = this.topUsersIpBarChartData.Series;

    this.setColumnChartApplications('top-sites-applications', 'MB');
    this.TopSitesColumnChart['xAxis']['categories'] = this.topsitesColumnChartData.chart.Labels;
    this.TopSitesColumnChart['series'] = this.topsitesColumnChartData.chart.Series;
  }

  createBandwidthCharts(){
    this.topApplicationId = Highcharts.chart('topApplicationId', this.TopApplications);
    this.topUsersIpBarId = Highcharts.chart('topUsersIpBarId', this.TopUsersIpsBar);
    this.topTrafficCategoryId = Highcharts.chart('topTrafficCategoryId', this.TopTrafficCategoriesPieChart)
    this.topSitesColumnChartId = Highcharts.chart('topSitesColumnChartId', this.TopSitesColumnChart)
  }

}

