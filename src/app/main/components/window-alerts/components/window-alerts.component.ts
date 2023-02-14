import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import * as Highcharts from 'highcharts';
import $ from "jquery";

@Component({
  selector: 'app-window-alerts',
  templateUrl: './window-alerts.component.html',
  styleUrls: ['./window-alerts.component.css']
})
export class WindowAlertsComponent implements OnInit {
  public loading = false;
  highcharts = Highcharts;
  public alertsChartData: any = {};
  public WinlogChartData: any = {};
  public TopAlertChartData: any = {};
  public startDate: any = new Date();;
  public endDate: any = new Date();
  public localSavedState: boolean = true;
  public IsOverviewCard: any = false;
  public filterFieldValue: any;
  public useFilter: boolean = false;
  public filterFieldName: string;
  public pieChartName: string;
  public pieChartDescription: string;

  //ids of chart expand
  public winlogData: any;
  public topAlerts: any;
  public alertsData: any;
  public topUsersId2: any;

  //ChartData

  public winlogEventChartData: any;
  public alertTimeChartData: any;
  public topUserChartData: any;
  public topAlertEventChartData: any;


  constructor(private _http: HttpService,
    private router: Router,
    private dtPipe: DatePipe,
    private _auth: AuthService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Window Alerts`);
    this.startDate = this.dtPipe.transform(
      '2023-02-02T10:00',
      'yyyy-MM-ddTHH:mm'
    );
    this.endDate = this.dtPipe.transform(
      '2023-02-02T12:00',
      'yyyy-MM-ddTHH:mm'
    );
    this.overviewDurationDashboard();
  }

  ngDoCheck(): void {
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
    this.alertsData.setSize(window.innerWidth / 2.55, undefined)
    // this.topUsersId2.setSize(window.innerWidth / 2.7, undefined)
    this.winlogData.setSize(window.innerWidth / 2.5, undefined)
    // this.topAlerts.setSize(window.innerWidth / 2.7, undefined)
  }

  expand() {
    this.alertsData.setSize(window.innerWidth / 2.05, undefined)
    // this.topUsersId2.setSize(window.innerWidth / 2.2, undefined)
    this.winlogData.setSize(window.innerWidth / 2.05, undefined)
    // this.topAlerts.setSize(window.innerWidth / 2.2, undefined)
  }

  dateTimeFilter() {
    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
  }

  overviewDurationDashboard() {
    const target = "#alertChart";
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
        "fieldValue": this.filterFieldName,
        "fieldType": this.filterFieldValue,
      }
    }

    this._http.post('eql/alert_chart', request).subscribe(
      async (res) => {
        if (res.status) {
          this.onDismiss();
          this.winlogEventChartData = res.data.TopUsers;
          this.alertTimeChartData = res.data.TopAlertNames;
          // this.topUserChartData = res.data.TopUsers;
          this.topAlertEventChartData = res.data.TopCategories;

          this.chartAlert();
          this.createAlertCharts();
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
          this.onDismiss();
        } else {
          this.loading = false;
          this.onDismiss();
        }
      }
    );
  }
  onDismiss() {
    const target = "#alertChart";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
  }

  //trafic chart
  setColumnChartData(widget: string, bytes: string = 'ms', type: string = 'Chart') {
    let self = this;
    // let WinlogChartData = {
    //   accessibility: {
    //     description: "Site"
    //   },
    //   chart: {
    //     zoomType: 'x',
    //     backgroundColor: 'snow',
    //     type: 'column',
    //     height: 380,

    //   },
    //   title: {
    //     text: type
    //   },
    //   xAxis: {
    //     // title: {
    //     //   text: 'date',
    //     // },
    //     type: 'datetime',
    //     dateTimeLabelFormats: {
    //       millisecond: '%I:%M:%S.%L %p',
    //       second: '%I:%M:%S %p',
    //       minute: '%I:%M %p',
    //       hour: '%I:%M %p',
    //     },
    //   },
    //   yAxis: {
    //     title: {
    //       text: 'Count'
    //     },
    //     // type: 'datetime',
    //     // dateTimeLabelFormats: {
    //     //   millisecond: '%I:%M:%S.%L',
    //     //   second: '%H:%M:%S',
    //     //   minute: '%H:%M',
    //     //   hour: '%H:%M',
    //     // }
    //   },
    //   tooltip: {
    //     pointFormat: '{series.name}: <b>{point.y} ' + '</b>',
    //     // formatter: function () {
    //     //   let a: any = this;
    //     //   var duration = a.y;
    //     //   var milliseconds = Math.floor((duration % 1000) / 100),
    //     //     seconds = Math.floor((duration / 1000) % 60),
    //     //     minutes = Math.floor((duration / (1000 * 60)) % 60),
    //     //     hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    //     //   hours = (hours < 10) ? 0 + hours : hours;
    //     //   minutes = (minutes < 10) ? 0 + minutes : minutes;
    //     //   seconds = (seconds < 10) ? 0 + seconds : seconds;

    //     //   if (hours < 10) {
    //     //     var str_hours = "0" + hours;
    //     //   }
    //     //   else {
    //     //     var str_hours = hours.toString();
    //     //   }

    //     //   if (minutes < 10) {
    //     //     var str_minutes = "0" + minutes;
    //     //   }
    //     //   else {
    //     //     var str_minutes = minutes.toString();
    //     //   }

    //     //   if (seconds < 10) {
    //     //     var str_seconds = "0" + seconds;
    //     //   }
    //     //   else {
    //     //     var str_seconds = seconds.toString();
    //     //   }

    //     //   var remaining_milliseconds = duration - ((hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000));
    //     //   var str_milliseconds = remaining_milliseconds.toString();
    //     //   return a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + '</b>'
    //     // },
    //   },
    //   plotOptions: {
    //     series: {
    //       pointWidth: 40,
    //       events: {
    //         click: function (event) {
    //           self.filterTypeDurationChart(event, this);
    //           return false;
    //         }
    //       }
    //     },
    //   },
    //   credits: {
    //     enabled: false
    //   },
    //   series: []
    // }

    let WinlogChartData = {
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
        text: type,
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
          text: 'Count'
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
              self.filterTypeDurationChart(event, this);
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
    if (widget === 'alerts-data') {
      this.alertsChartData = WinlogChartData;
    }
  }

  topPieDataApplication(widget: string, bytes: string = 'MB', type: string = 'Chart', filterName: string = 'Filter') {
    let self = this;
    let TopApplicationsColumnChartData = {
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
        text: type,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y} ' + '</b>',
        // formatter: function () {
        //   let a: any = this;
        //   var duration = a.y;
        //   var milliseconds = Math.floor((duration % 1000) / 100),
        //     seconds = Math.floor((duration / 1000) % 60),
        //     minutes = Math.floor((duration / (1000 * 60)) % 60),
        //     hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        //   hours = (hours < 10) ? 0 + hours : hours;
        //   minutes = (minutes < 10) ? 0 + minutes : minutes;
        //   seconds = (seconds < 10) ? 0 + seconds : seconds;

        //   if (hours < 10) {
        //     var str_hours = "0" + hours;
        //   }
        //   else {
        //     var str_hours = hours.toString();
        //   }

        //   if (minutes < 10) {
        //     var str_minutes = "0" + minutes;
        //   }
        //   else {
        //     var str_minutes = minutes.toString();
        //   }

        //   if (seconds < 10) {
        //     var str_seconds = "0" + seconds;
        //   }
        //   else {
        //     var str_seconds = seconds.toString();
        //   }

        //   var remaining_milliseconds = duration - ((hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000));
        //   var str_milliseconds = remaining_milliseconds.toString();
        //   return a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + ' (' + a.point.percentage.toFixed([3]) + ' % ) ' + '</b>'
        // },
      },

      plotOptions: {
        series: {
        },
        pie: {
          innerSize: 120,
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
            //   self.filterTypeDurationChart(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            click: function (event) {
              self.filterTypePieChart(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.filterTypeDurationChart(),
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
    if (widget === 'winlog-data') {
      this.WinlogChartData = TopApplicationsColumnChartData;
    }
    // if (widget === 'top-alert') {
    //   this.TopAlertChartData = TopApplicationsColumnChartData;
    // }
  }


  public chartAlert() {

    this.setColumnChartData('alerts-data', 'ms', 'Alerts');
    this.alertsChartData['series'] = this.alertTimeChartData.chart.Series;
    // this.alertsChartData['xAxis']['categories'] = this.alertTimeChartData.chart.Labels;

    this.topPieDataApplication('winlog-data', 'MB', 'Top Users', 'Winlog');
    this.WinlogChartData['series'] = this.winlogEventChartData.chart.Series;

    // this.topPieDataApplication('top-alert', 'MB', 'Top Alert Event codes', 'TopAlert');
    // this.TopAlertChartData['series'] = this.topAlertEventChartData.chart.Series;
  }

  createAlertCharts() {
    this.alertsData = Highcharts.chart('alertsData', this.alertsChartData);
    this.winlogData = Highcharts.chart('winlogData', this.WinlogChartData);
    // this.topAlerts = Highcharts.chart('topAlerts', this.TopAlertChartData);
  }

  filterTypeDurationChart(event: any, data: any) {
    // chart.options.accessibility.description
    // this.filterFieldValue = event.point.series.name;

    //legend click

    this.filterFieldName = event.point.category;
    this.filterFieldValue = data.chart.options.accessibility.description;
    let lk = data.options.custom;
    this.useFilter = true;
    this.overviewDurationDashboard();
    // throw new Error('Function not implemented.');
  }
  filterTypePieChart(event: any, data: any) {
    this.filterFieldName = event.point.name;
    this.filterFieldValue = data.chart.options.accessibility.description;
    this.useFilter = true;
    this.overviewDurationDashboard();
  }
  resetFilters() {
    this.useFilter = false;
    this.overviewDurationDashboard();
  }

}


