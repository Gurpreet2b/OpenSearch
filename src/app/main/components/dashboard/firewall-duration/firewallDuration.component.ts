import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import HighchartsMore from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';
import $ from "jquery";
import { title } from 'process';
@Component({
  selector: 'app-firewallDuration',
  templateUrl: './firewallDuration.component.html',
  styleUrls: ['./firewallDuration.component.css']
})
export class FirewallDurationComponent implements OnInit {
  public loading = false;
  highcharts = Highcharts;
  public FWTopSitesChartData: any = {};
  public TopUserIpsBarChartData: any = {};
  public TopApplicationsChartData: any = {};
  public TopCategoriesChartData: any = {};
  public startDate: any = new Date();;
  public endDate: any = new Date();
  public localSavedState: boolean = true;

  public filterFieldValue: any;
  public useFilter: boolean = false;
  public filterFieldName: string;
  public pieChartName: string;
  public pieChartDescription: string;

  //ids of chart expand
  public topApplicationId2: any;
  public topCategories: any;
  public fwTopSitesId2: any;
  public topUsersId2: any;

  //ChartData

  public topApplicationChartData: any;
  public topSitesChartData: any;
  public topUserChartData: any;
  public topCategoriesChartData: any;


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
    this.fwTopSitesId2.setSize(window.innerWidth / 2.6, undefined)
    this.topUsersId2.setSize(window.innerWidth / 2.7, undefined)
    this.topApplicationId2.setSize(window.innerWidth / 2.6, undefined)
    this.topCategories.setSize(window.innerWidth / 2.7, undefined)
  }

  expand() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.3);
    this.fwTopSitesId2.setSize(window.innerWidth / 2.2, undefined)
    this.topUsersId2.setSize(window.innerWidth / 2.2, undefined)
    this.topApplicationId2.setSize(window.innerWidth / 2.2, undefined)
    this.topCategories.setSize(window.innerWidth / 2.2, undefined)
  }

  dateTimeFilter() {
    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
    console.log(request);
  }

  overviewDurationDashboard() {
    const target = "#durationChart";
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
        "filterType": this.pieChartName,
        "filterValue": this.pieChartDescription,
      }
    }

    this._http.post('eql/duration', request).subscribe(
      async (res) => {
        if (res.status) {
          // alert('Success');
          this.onDismiss();
          console.log(res)
          this.topApplicationChartData = res.data.TopApplications;
          this.topSitesChartData = res.data.TopSites;
          this.topUserChartData = res.data.TopUsers;
          this.topCategoriesChartData  = res.data.TopCategories;

          this.chartDuration();
          this.createDurationCharts();
        } else {
          this.loading = false;
          // alert('something is wrong');
          this.onDismiss();
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          this.loading = false;
          this.onDismiss();
          // alert(error.error.error);
        } else {
          this.loading = false;
          this.onDismiss();
          // alert(error.error.error);
        }
      }
    );
  }
  onDismiss() {
    const target = "#durationChart";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
    // const ele =  $('#viewGenerateReport');

    // $('#viewGenerateReport').modal('toggle')
    // ele.modal('toggle')
  }
  //trafic chart
  setColumnChartData(widget: string, bytes: string = 'ms', type: string = 'Chart') {
    let self = this;
    let TopApplicationsChartData = {
      accessibility: {
        description: "Sites"
      },
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'column',
        height: 380,

      },
      title: {
        text: type
      },
      xAxis: {
        // title: {
        //   text: 'date',
        // },
        type: 'datetime',
        dateTimeLabelFormats: {
          millisecond: '%I:%M:%S.%L %p',
          second: '%I:%M:%S %p',
          minute: '%I:%M %p',
          hour: '%I:%M %p',
          // day: '%e. %b',
          // week: '%e. %b',
          // month: "%b '%y",
          // year: '%Y',
        },
      },
      yAxis: {
        title: {
          text: 'Duration'
        },
        type: "datetime",
        datetimeLabelFormats: {
          millisecond: '%H:%M:%S.%L',
          second: '%H:%M:%S',
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%e. %b',
          week: '%e. %b',
          month: '%b \'%y',
          year: '%Y'

        }
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
            //   self.outfun(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            legendItemClick: function (event) {
              self.outfun(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.outfun(),
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
      //   },
      //   series: {
      //     pointWidth: 30,
      //   },
      // },

      credits: {
        enabled: false
      },
      // series: this.topColumnChartData
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
      this.FWTopSitesChartData = TopApplicationsChartData;
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
    let self = this;
    let TopApplicationsBarChartData = {
      accessibility: {
        description: "Users"
      },
      chart: {
        type: 'bar',
        backgroundColor: 'snow',
        height: 380,

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
            //   self.outfun(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            legendItemClick: function (event) {
              self.outfun(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.outfun(),
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
    if (widget === 'top-applications') {
      this.TopUserIpsBarChartData = TopApplicationsBarChartData;
    }
  }

  topPieDataApplication(widget: string, bytes: string = 'MB', type: string = 'Chart') {
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
    let self = this;
    let TopApplicationsColumnChartData = {
      accessibility: {
        description: "Applications"
      },
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'pie',
        height: 350
      },
      title: {
        text: type
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
          return a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + ' (' + a.point.percentage.toFixed([3]) + ' % ) ' + '</b>'
          // var milliseconds = Math.floor((duration % 1000) / 100),
          //   seconds = Math.floor((duration / 1000) % 60),
          //   minutes = Math.floor((duration / (1000 * 60)) % 60),
          //   hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

          // hours = (hours < 10) ? 0 + hours : hours;
          // minutes = (minutes < 10) ? 0 + minutes : minutes;
          // seconds = (seconds < 10) ? 0 + seconds : seconds;

          // return a.series.name + ' : <b>' + hours + ":" + minutes + ":" + seconds + ' (' + a.point.percentage.toFixed([3]) + ' % ) ' + '</b>'

        },
      },
      // accessibility: {
      //   point: {
      //     valueSuffix: '%'
      //   }
      // },
      plotOptions: {
        series: {
          // states: {
          //   hover: {
          //     enabled: false,
          //   },
          //   inactive: {
          //     opacity: 1,
          //   },
          // },
          // events: {
          //   // click: function (event) {
          //   //   console.log('%%%', event)
          //   //   console.log('######', this)
          //   //   self.outfun(event, this);
          //   //   // self.filterFieldValue = event.point.series.name;
          //   // },

          //   show: function (event) {
          //     console.log(event);
          //     console.log(this);
          //     self.outfun(event, this);
          //     return false;
          //     // if (!confirm('The series is currently ' +
          //     //              visibility + '. Do you want to change that?')) {
          //     //     
          //     // }
          //   }
          //   // clicking: this.outfun(),
          // }
        },
        pie: {
          innerSize: 5,
          // depth: 45,

          allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            enabled: true,
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
            //   self.outfun(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            click: function (event) {
              console.log(event);
              console.log(this);
              self.pieChartDataName(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.outfun(),
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
    if (widget === 'top-applications-data') {
      this.TopApplicationsChartData = TopApplicationsColumnChartData;
    }
    if (widget === 'top-categories') {
      this.TopCategoriesChartData = TopApplicationsColumnChartData;
    }
  }


  public chartDuration() {
    console.log('initializing charts');

    this.setColumnChartData('top-fw-sites', 'ms', 'Top Sites');
    this.FWTopSitesChartData['series'] = this.topSitesChartData.chart.Series;
    this.FWTopSitesChartData['xAxis']['categories'] = this.topSitesChartData.chart.Labels;

    this.setBarChartData('top-applications', 'MB', 'Top User Ips');
    this.TopUserIpsBarChartData['series'] = this.topUserChartData.Series;
    this.TopUserIpsBarChartData['xAxis']['categories'] = this.topUserChartData.Labels;

    this.topPieDataApplication('top-applications-data', 'MB', 'Top Applications');
    this.TopApplicationsChartData['series'] = this.topApplicationChartData.chart.Series;

    this.topPieDataApplication('top-categories', 'MB', 'Top Categories');
    this.TopCategoriesChartData['series'] = this.topCategoriesChartData.chart.Series;
  }

  createDurationCharts() {
    this.fwTopSitesId2 = Highcharts.chart('fwTopSitesId2', this.FWTopSitesChartData)
    this.topUsersId2 = Highcharts.chart('topUsersId2', this.TopUserIpsBarChartData)
    this.topApplicationId2 = Highcharts.chart('topApplicationId2', this.TopApplicationsChartData)
    this.topCategories = Highcharts.chart('topCategories', this.TopCategoriesChartData)
  }

  outfun(event: any, data: any) {
    // console.log(event);
    // console.log(data);
    // console.log('test event', event.point.y);
    // console.log('test data', data.name);
    // chart.options.accessibility.description
    // this.filterFieldValue = event.point.series.name;

    //legend click

    this.filterFieldValue = data.name;
    this.filterFieldName = data.chart.options.accessibility.description;
    let lk = data.options.custom;
    this.useFilter = true;
    this.overviewDurationDashboard();
    // throw new Error('Function not implemented.');
  }
  pieChartDataName(event: any, data:any){
    this.pieChartName = event.point.name;
    this.pieChartDescription = data.chart.options.accessibility.description;
  }
  resetFilters() {
    this.useFilter = false;
    this.overviewDurationDashboard();
  }


}

