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
  public loading = false;
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

  //ChartData

  public topApplicationChartData: any;
  public topSitesChartData: any;
  public topUserChartData: any;

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
    this.startDate = this.dtPipe.transform(
      '2022-10-24T10:00',
      'yyyy-MM-ddTHH:mm'
    );
    this.endDate = this.dtPipe.transform(
      '2022-10-24T10:11',
      'yyyy-MM-ddTHH:mm'
    );
    this.overviewDurationDashboard();
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

  overviewDurationDashboard(){
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
  
      this._http.post('eql/duration', request).subscribe(
        async (res) => {
          if (res.status) {
            alert('Success');
            console.log(res)
        
            this.topApplicationChartData = res.data.TopApplications;
            this.topSitesChartData = res.data.TopSites;
            this.topUserChartData = res.data.TopUsers;
            // this.topBlockedSitesChartData = res.data.TopBlockedSites;
            // this.filterActionTableData = res.data
            // this.topUsersIpBarChartData = res.data.TopUsers;
            // this.topsitesColumnChartData = res.data.TopSites;
            // this.topDownloadTableData = res.data.TopDownloads;
            this.chartDuration();
            this.createDurationCharts();
            // this.IsOverviewCard = true;
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
  setColumnChartData(widget: string, bytes: string = 'MB', type: string = 'Chart') {
    let TopApplicationsChartData = {
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'column'
      },
      title: {
        text: type
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
      series: []

    }

    // let TopApplicationsChartData = {
    //   chart: {
    //     //  plotBorderWidth: null,
    //     type: 'pie',
    //     plotShadow: false,
    //     backgroundColor: 'snow',
    //   },
    //   title: {
    //     text: '',
    //   },
    //   tooltip: {
    //     pointFormat:
    //       '{series.name}: <b>{point.y} ' +
    //       bytes +
    //       ' ({point.percentage:.1f}%) </b>',
    //   },
    //   credits: {
    //     enabled: false,
    //   },
    //   yAxis: {
    //     labels: {
    //       format: '${value}',
    //       title: {
    //         text: 'Thousands',
    //       },
    //     },
    //   },
    //   plotOptions: {
    //     pie: {
    //       allowPointSelect: true,
    //       cursor: 'pointer',

    //       dataLabels: {
    //         enabled: true,
    //         format: '<b>{point.percentage:.1f}%<b>',
    //         style: {
    //           fontSize: '10px',
    //         },
    //         connectorShape: 'straight',
    //         crookDistance: '70%',
    //       },
    //       showInLegend: true,
    //     },
    //     series: {
    //       states: {
    //         hover: {
    //           enabled: false,
    //         },
    //         inactive: {
    //           opacity: 1,
    //         },
    //       },
    //     },
    //   },
    //   // legend: {
    //   //   align: 'right',
    //   //   verticalAlign: 'top',
    //   //   layout: 'vertical',
    //   //   x: -10,
    //   //   y: 85,
    //   //   itemMarginTop: 5,
    //   //   itemDistance: 20,
    //   // },
    //   series: [
    //     {
    //       type: 'pie',
    //       name: 'Brands',
    //       colorByPoint: true,
    //       data: [],
    //     },
    //   ],
    // };
    if (widget === 'top-fw-sites') {
      this.FWTopSitesPieChartData = TopApplicationsChartData;
    }
  }

  
  setBarChartData(widget: string, bytes: string = 'MB', type: string = 'Chart') {
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
    //   },
    //   yAxis: {
    //   },
    //   tooltip: {
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
    //   series: this.topBarChartData

    // }

    let TopApplicationsBarChartData = {
      chart: {
        type: 'bar',
        backgroundColor: 'snow',
        events: {
          redraw: (chart: any) => {
            console.log('bar callback event');
            console.log(chart);
            let categoryHeight = 20;
            chart.update({
              chart: {
                height:
                  categoryHeight * chart.pointCount +
                  (chart.chartHeight - chart.plotHeight),
              },
            });
            // chart.target.callback(this);
          },
        },
      },
      title: {
        text: type
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
    if (widget === 'top-applications') {
      this.TopUserIpsBarChartData = TopApplicationsBarChartData;
    }
  }

  topPieChartDataApplication(widget: string, bytes: string = 'MB', type: string= 'Chart') {
    // let TopApplicationsColumnChartData = {
    //   chart: {
    //     zoomType: 'x',
    //     backgroundColor: 'snow',
    //     type: 'column'
    //   },
    //   title: {
    //     text: 'Top Applications'
    //   },
    //   xAxis: {
    //     title: {
    //       text: null
    //     }
    //   },
    //   yAxis: {
    //   },
    //   tooltip: {
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
    //   series: []

    // }

    let TopApplicationsColumnChartData = {
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
          innerSize: 70,
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
    if (widget === 'top-applications-data') {
      this.TopApplicationsChartData = TopApplicationsColumnChartData;
    }
  }


  public chartDuration() {
    console.log('initializing charts');

    this.setColumnChartData('top-fw-sites', 'MB', 'Top Applications');
    this.FWTopSitesPieChartData['series'] = this.topSitesChartData.chart.Series;
    // this.FWTopSitesPieChartData['xAxis']['categories'] = this.topSitesChartData.chart.Labels;
    // this.FWTopSitesPieChartData['series'][0]['data'] =
    //     this.topSitesChartData.chart.Series[0].data;


    this.setBarChartData('top-applications', 'MB', 'Top User Ips');
    this.TopUserIpsBarChartData['series'] = this.topUserChartData.Series;
    this.TopUserIpsBarChartData['xAxis']['categories'] = this.topUserChartData.Labels;

    this.topPieChartDataApplication('top-applications-data', 'MB', 'FW Top Site');
    this.TopApplicationsChartData['series'] = this.topApplicationChartData.chart.Series;
  }

  createDurationCharts(){
    this.topApplicationId2 = Highcharts.chart('topApplicationId2', this.TopApplicationsChartData)
    this.fwTopSitesId2 = Highcharts.chart('fwTopSitesId2', this.FWTopSitesPieChartData)
    this.topUsersId2 = Highcharts.chart('topUsersId2', this.TopUserIpsBarChartData)
  }


}

