import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';

import * as Highcharts from 'highcharts';
import $ from "jquery";
@Component({
  selector: 'app-EDR',
  templateUrl: './EDR.component.html',
  styleUrls: ['./EDR.component.css']
})
export class EDRComponent implements OnInit {
  public loading = false;
  highcharts = Highcharts;
  public multidatachart: any = {};
  public BandwidthOverTimeChart: any = {};
  public TrafficActionsOverTime: any = {};
  public TopAllowSites: any = {};
  public TopApplicationsBarChartData: any = {};
  public TopBypassedWebsiteChart: any = {};
  public TopBlockedChart: any = {};
  public TopCategoriesPieChartData: any = {};
  public TopUsersColumnChart: any = {};
  public TopSurfedSiteColumnChart: any = {};
  public startDate: any = new Date();
  public endDate: any = new Date();
  public localSavedState: boolean = true;
  public IsOverviewCard: any = false;

  public filterFieldValue: any;
  public useFilter: boolean = false;
  public filterFieldName: string;
  public pieChartName: string;
  public pieChartDescription: string;
  //ids of chart expand
  public topAllowedSiteId: any;
  public topBypassedChartId: any;
  public topCategoriesChartId: any;
  public topUsersColumnChartId: any;
  public topSurfedColumnChartId: any;
  public topBlockedChartId: any;


  //chart Data
  public topAllowSitesPieChartData: any;
  public toptrafficCategoriesChartData: any;
  public topBlockedChartData: any;
  public topUsersColumnChartData: any;
  public topSurfedColumnChartData: any;
  public topCategoriesChartData: any;
  public topBypassedChartData: any;

  //table data
  // public topDownloadTableData: any = [];

  // topColumnChartData: any = []

  // topBarChartData: any = []

  // topPieChartData: any = []

  // traffic: any = []

  constructor(private _http: HttpService,
    private router: Router,
    private dtPipe: DatePipe,
    private _auth: AuthService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Sophos EDR`);
    this.startDate = this.dtPipe.transform(
      '2022-10-03T14:30',
      'yyyy-MM-ddTHH:mm'
    );
    this.endDate = this.dtPipe.transform(
      '2022-10-03T16:00',
      'yyyy-MM-ddTHH:mm'
    );
    this.EDRDashboard();

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
    this.topAllowedSiteId.setSize(window.innerWidth / 3.85, undefined)
    this.topUsersColumnChartId.setSize(window.innerWidth / 1.88, undefined)
    this.topCategoriesChartId.setSize(window.innerWidth / 3.9, undefined)
    this.topSurfedColumnChartId.setSize(window.innerWidth / 1.9, undefined)
    this.topBypassedChartId.setSize(window.innerWidth / 3.9, undefined)
    this.topBlockedChartId.setSize(window.innerWidth / 1.85, undefined)
  }

  expand() {
    this.topAllowedSiteId.setSize(window.innerWidth / 3.1, undefined)
    this.topUsersColumnChartId.setSize(window.innerWidth / 1.58, undefined)
    this.topCategoriesChartId.setSize(window.innerWidth / 3.2, undefined)
    this.topSurfedColumnChartId.setSize(window.innerWidth / 1.58, undefined)
    this.topBypassedChartId.setSize(window.innerWidth / 3.2, undefined)
    this.topBlockedChartId.setSize(window.innerWidth / 1.56, undefined)
  }

  dateTimeFilter() {
    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
    console.log(request);
  }

  EDRDashboard() {
    const target = "#EDRChart";
    $(target).show();
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

    if (this.useFilter) {
      request.filter = {
        "fieldValue": this.filterFieldValue,
        "fieldType": this.filterFieldName,
        // "filterValue": this.pieChartDescription,
        // "filterType": this.pieChartName,
      }
    }


    this._http.post('eql/edr', request).subscribe(
      async (res) => {
        if (res.status) {
          this.onDismiss();
          // alert('Success');
          console.log(res)

          this.topAllowSitesPieChartData = res.data.TopAllowedSites;
          this.toptrafficCategoriesChartData = res.data.TopAllowedSites;
          this.topBlockedChartData = res.data.TopBlockedSites;
          this.topBypassedChartData = res.data.TopBypassedSites;
          this.topUsersColumnChartData = res.data.TopUsers;
          this.topSurfedColumnChartData = res.data.TopSurfedSites;
          this.topCategoriesChartData = res.data.TopCategories
          this.chartEDR();
          this.createEDRChart();
          this.IsOverviewCard = true;
        } else {
          this.loading = false;
          this.onDismiss();
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          this.loading = false;
          // alert(error.error.error);
          this.onDismiss();
        } else {
          this.loading = false;
          this.onDismiss();
          // alert(error.error.error);
        }
      }
    );
  }


  onDismiss() {
    const target = "#EDRChart";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");

  }


  //trafic chart
  setPieChartApplications(widget: string, bytes: string = 'MB', title: string = 'Chart', filterName: string = 'Filter') {
    let self = this;
    let TopApplicationsChartData = {
      accessibility: {
        description: filterName
      },
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'pie',
        height: 380
      },
      title: {
        text: title,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
      },
      tooltip: {
        pointFormat:
          '{series.name}: <b>{point.y} ' +
          bytes +
          ' ({point.percentage:.1f}%) </b>',
      },
      // accessibility: {
      //   point: {
      //     valueSuffix: '%'
      //   }
      // },
      plotOptions: {
        series: {
        
        },
        pie: {
          innerSize: 40,
          // depth: 45,

          allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            enabled: false,
            format: '<b>{point.percentage:.1f}%<b>',
            style: {
              fontSize: '10px',
            },
            connectorShape: 'straight',
            crookDistance: '70%',
          },
          showInLegend: true,
          events: {
            // click: function (event) {
            //   console.log('%%%', event)
            //   console.log('######', this)
            //   self.filterTypeBarChart(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            click: function (event) {
              console.log(event);
              console.log(this);
              self.filterTypePieChart(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.filterTypeBarChart(),
          }
        },
      },

      // plotOptions: {
      //   pie: {
      //     innerSize: 60,
      //     allowPointSelect: true,
      //     cursor: 'pointer',
      //     dataLabels: {
      //       enabled: false
      //     },
      //     showInLegend: true
      //   }
      // },
      credits: {
        enabled: false
      },
      // series: this.topPieChartData
      series: []

    }
  
    if (widget === 'top-allowed-sites') {
      this.TopAllowSites = TopApplicationsChartData;
    }
    if (widget === 'top-categories-data') {
      this.TopCategoriesPieChartData = TopApplicationsChartData;
    }
  }

  setBarChartApplications(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    let self = this;
    let TopApplicationsBarChartData = {
      chart: {
        type: 'bar',
        backgroundColor: 'snow',
        events: {
          redraw: (chart: any) => {
            console.log('bar callback event stacked');
            console.log(chart);
            let categoryHeight = 20;
            // console.log(chart.xAxis[0].categories.length);
            chart.update({
              chart: {
                height:
                  categoryHeight * chart.xAxis[0].categories.length +
                  (chart.chartHeight - chart.plotHeight),
              },
            });
            // chart.target.callback(this);
          },
        },
      },
      title: {
        text: title,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
      },
      xAxis: {
        categories: [],
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
        valueSuffix: ' sMB',
      },
      legend: {
        enabled: true,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: false,
          },
          // maxPointWidth: 15,
        },
        series: {
          stacking: 'normal',
          groupPadding: 0,
          pointPadding: 0,
        },
      },
      credits: {
        enabled: false
      },
      series: [],
    };
    // let TopApplicationsBarChartData = {
    //   accessibility: {
    //     description: "User"
    //   },
    //   chart: {
    //     type: 'bar',
    //     backgroundColor: 'snow',
    //     height: 380
    //   },
    //   title: {
    //     text: title,
    //     style: {
    //       fontWeight: 'bold',
    //       fontSize: '16'
    //   }
    //   },
    //   xAxis: {
    //     categories: [],

    //     title: {
    //       text: null,
    //     },
    //   },
    //   yAxis: {
    //     min: 0,
    //     title: {
    //       text: 'Bandwidth',
    //       align: 'high',
    //     },
    //     labels: {
    //       overflow: 'justify',
    //     },
    //   },
    //   tooltip: {
    //     valueSuffix: ' MB',
    //   },
    //   plotOptions: {
    //     series: {
    //       events: {

    //         click: function (event) {
    //           console.log(event);
    //           console.log(this);
    //           self.filterTypeBarChart(event, this);
    //           return false;
    //       },
          
    //       }
    //     },
    //   },
    //   credits: {
    //     enabled: false,
    //   },
    //   series: [],
    // };
    if (widget === 'top-bypassed-chart') {
      this.TopBypassedWebsiteChart = TopApplicationsBarChartData;
    }
    if (widget === 'top-blocked-chart') {
      this.TopBlockedChart = TopApplicationsBarChartData;
    }
  }

  setColumnChartApplications(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    let self = this;
    let TopApplicationsColumnChartData = {
      accessibility: {
        description: "User"
      },
      chart: {
        type: 'bar',
        backgroundColor: 'snow',
        height: 380,

      },
      title: {
        text: title,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
      },
      xAxis: {
        categories: [],

        title: {
          text: null,
        },
        // labels: {
        //   overflow: 'justify',
        // },
      },

      
      yAxis: {
        min: 0,
        // title: {
        //   text: 'Bandwidth',
        //   align: 'high',
        // },
        // labels: {
        //   overflow: 'justify',
        // },
      },
      tooltip: {
        formatter: function () {
          let a: any = this;
          var duration = a.y;

          var milliseconds = Math.floor((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

          hours = (hours < 10) ? 0 + hours : hours;
          minutes = (minutes < 10) ? 0 + minutes : minutes;
          seconds = (seconds < 10) ? 0 + seconds : seconds;

          if (hours < 10) {
            var str_hours = "0" + hours;
          }
          else {
            var str_hours = hours.toString();
          }

          if (minutes < 10) {
            var str_minutes = "0" + minutes;
          }
          else {
            var str_minutes = minutes.toString();
          }

          if (seconds < 10) {
            var str_seconds = "0" + seconds;
          }
          else {
            var str_seconds = seconds.toString();
          }

          var remaining_milliseconds = duration - ((hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000));
          var str_milliseconds = remaining_milliseconds.toString();
          // if (milliseconds <10) {
          //     var str_milliseconds = "0" + milliseconds;
          // }
          // else {
          //     var str_milliseconds = milliseconds.toString();
          // }

          // return  + ":" +  + ":" +  + "." + ;
          return a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + '</b>'
          // var milliseconds = Math.floor((duration % 1000) / 100),
          //   seconds = Math.floor((duration / 1000) % 60),
          //   minutes = Math.floor((duration / (1000 * 60)) % 60),
          //   hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

          // hours = (hours < 10) ? 0 + hours : hours;
          // minutes = (minutes < 10) ? 0 + minutes : minutes;
          // seconds = (seconds < 10) ? 0 + seconds : seconds;

          // return a.series.name + ' : <b>' + hours + ":" + minutes + ":" + seconds  + '</b>'

        },
        // pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      },

      plotOptions: {
        series: {
          events: {
            // click: function (event) {
            //   console.log('@@@@', event)
            //   console.log('######', this)
            //   self.filterTypeDurationChart(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },
            click: function (event) {
              console.log(event);
              console.log(this);
              // self.filterTypeDurationChart(event, this);
              return false;
          },
            // click: function (event) {
            //   self.filterTypeDurationChart(event, this);
            //   return false;
            //   // if (!confirm('The series is currently ' +
            //   //              visibility + '. Do you want to change that?')) {
            //   //     
            //   // }
            // }
            // clicking: this.filterTypeDurationChart(),
          }
        },
        // line:{
        // custom:"Protocol",
        // accessibility:{
        //   description: "dsahgh",
        //   enabled: true
        // }

        // }
      },
      // plotOptions: {
      //   bar: {
      //     dataLabels: {
      //       // groupPadding: 0,
      //       // pointPadding: 0,
      //       enabled: false,
      //     },
      //     // maxPointWidth: 30,
      //   },
      //   series: {
      //     pointWidth: 15,
      //   },
      // },
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
    // let TopApplicationsColumnChartData = {
    //   accessibility: {
    //     description: "Site"
    //   },
    //   chart: {
    //     zoomType: 'x',
    //     backgroundColor: 'snow',
    //     type: 'column',
    //     height: 380
    //   },
    //   title: {
    //     useHTML: true,
    //     text: `<span style="font-family:Nunito;">`+title +`</span>`
    //   },
    //   xAxis: {
    //     type: 'datetime',
    //       dateTimeLabelFormats: {
    //         millisecond: '%I:%M:%S.%L %p',
    //         second: '%I:%M:%S %p',
    //         minute: '%I:%M %p',
    //         hour: '%I:%M %p',
    //       },
    //   },
    //   yAxis: {
    //     title: {
    //       text: 'Bandwidth (MBs)'
    //     }
    //   },
    //   tooltip: {
    //     pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
    //   },
    //   plotOptions: {
    //     series: {
    //       stacking: 'normal',
    //       events: {
    //         click: function (event) {
    //           self.filterTypeBarChart(event, this);
    //           return false;
    //         }
    //         // clicking: this.filterTypeBarChart(),
    //       }
    //     },
    //     // line:{
    //     // custom:"Protocol",
    //     // accessibility:{
    //     //   description: "dsahgh",
    //     //   enabled: true
    //     // }

    //     // }
    //   },
    //   // plotOptions: {
    //   //   bar: {
    //   //     dataLabels: {
    //   //       enabled: false
    //   //     }
    //   //   }
    //   // },

    //   credits: {
    //     enabled: false
    //   },
    //   // series: this.topColumnChartData
    //   series: []
    // }
    if (widget === 'top-users') {
      this.TopUsersColumnChart = TopApplicationsColumnChartData;
    }
    // if (widget === 'top-surfed-sites') {
    //   this.TopSurfedSiteColumnChart = TopApplicationsColumnChartData;
    // }
  }

  setBarChartData(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    let self = this;
    let TopApplicationsBarChart = {
      accessibility: {
        description: "Site"
      },
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'column',
        height: 380
      },
      title: {
        // useHTML: true,
        // text: `<span style="font-family:Nunito;">`+title +`</span>`
        text: title,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
      },
      xAxis: {
        type: 'datetime',
          dateTimeLabelFormats: {
            millisecond: '%I:%M:%S.%L %p',
            second: '%I:%M:%S %p',
            minute: '%I:%M %p',
            hour: '%I:%M %p',
          },
      },
      yAxis: {
        title: {
          text: 'Bandwidth (MBs)'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      },
      plotOptions: {
        series: {
          stacking: 'normal',
          events: {
            click: function (event) {
              self.filterTypeBarChart(event, this);
              return false;
            }
            // clicking: this.filterTypeBarChart(),
          }
        },
        // line:{
        // custom:"Protocol",
        // accessibility:{
        //   description: "dsahgh",
        //   enabled: true
        // }

        // }
      },
      // plotOptions: {
      //   bar: {
      //     dataLabels: {
      //       enabled: false
      //     }
      //   }
      // },

      credits: {
        enabled: false
      },
      // series: this.topColumnChartData
      series: []
    }
    // if (widget === 'top-users') {
    //   this.TopUsersColumnChart = TopApplicationsColumnChartData;
    // }
    if (widget === 'top-surfed-sites') {
      this.TopSurfedSiteColumnChart = TopApplicationsBarChart;
    }
  }

  public chartEDR() {
    console.log('initializing charts');

    this.setPieChartApplications('top-allowed-sites', 'MB', 'Top Allowed Websites', 'Application');
    this.TopAllowSites['series'] = this.topAllowSitesPieChartData.chart.Series;
    // this.TopCategoriesPieChartData['series'] = this.topPieChartData;

    this.setColumnChartApplications('top-users', 'MB', 'Top Users');
    this.TopUsersColumnChart['xAxis']['categories'] = this.topUsersColumnChartData.chart.Labels;
    this.TopUsersColumnChart['series'] = this.topUsersColumnChartData.chart.Series;

    this.setPieChartApplications('top-categories-data', 'MB', 'Top Categories', 'Category');
    this.TopCategoriesPieChartData['series'] = this.topCategoriesChartData.chart.Series;

    this.setBarChartData('top-surfed-sites', 'MB', 'Top Surfed Sites');
    // this.TopSurfedSiteColumnChart['xAxis']['categories'] = this.topSurfedColumnChartData.chart.Labels;
    this.TopSurfedSiteColumnChart['series'] = this.topSurfedColumnChartData.chart.Series;

    this.setBarChartApplications('top-bypassed-chart', 'MB', 'Top Bypassed Websites');
    this.TopBypassedWebsiteChart['xAxis']['categories'] = this.topBypassedChartData.chart.Labels;
    this.TopBypassedWebsiteChart['series'] = this.topBypassedChartData.chart.Series;

    this.setBarChartApplications('top-blocked-chart', 'MB', 'Top Blocked Site Accessed by User');
    this.TopBlockedChart['xAxis']['categories'] = this.topBlockedChartData.Labels;
    this.TopBlockedChart['series'] = this.topBlockedChartData.Series;

  }

  createEDRChart() {
    this.topAllowedSiteId = Highcharts.chart('topAllowedSiteId', this.TopAllowSites);
    this.topUsersColumnChartId = Highcharts.chart('topUsersColumnChartId', this.TopUsersColumnChart);
    this.topCategoriesChartId = Highcharts.chart('topCategoriesChartId', this.TopCategoriesPieChartData);
    this.topSurfedColumnChartId = Highcharts.chart('topSurfedColumnChartId', this.TopSurfedSiteColumnChart)
    this.topBypassedChartId = Highcharts.chart('topBypassedChartId', this.TopBypassedWebsiteChart);
    this.topBlockedChartId = Highcharts.chart('topBlockedChartId', this.TopBlockedChart);
  }

  filterTypeBarChart(event: any, data: any) {
    // console.log(event);
    // console.log(data);
    // console.log('test event', event.point.y);
    // console.log('test data', data.name);
    // chart.options.accessibility.description
    // this.filterFieldValue = event.point.series.name;

    //legend click
    
    this.filterFieldValue = event.point.category;
    this.filterFieldName = data.chart.options.accessibility.description;
    let lk = data.options.custom;
    this.useFilter = true;
    this.EDRDashboard();
    // throw new Error('Function not implemented.');
  }
  filterTypePieChart(event: any, data:any){
    this.filterFieldName = data.chart.options.accessibility.description;
    this.filterFieldValue = event.point.name; 
    this.useFilter = true;
    this.EDRDashboard();
  }
  resetFilters() {
    this.useFilter = false;
    this.EDRDashboard();
  }

}

