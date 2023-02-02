import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnChanges, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import HighchartsMore from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';
import $ from "jquery";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public loading = false;
  public fromHours: number = 1;
  highcharts = Highcharts;
  public multidatachart: any = {};
  public ProductivityOverTimeChartData: any = {};
  public TrafficActionsOverTime: any = {};
  public TotalProductivityPieChart: any = {};
  public TrafficActionsPieChart: any = {};
  public BarChartData: any = {};
  public BandwidthOverTimeChartData: any = {};
  public fullStartDate: any = new Date();
  public fullEndDate: any = new Date();
  public localSavedState: boolean = true;
  public bandwidthOvertime: any = [];
  public showIt = true;
  public IsOverviewCard: any = false;
  public filterFieldValue: any;
  public useFilter: boolean = false;
  public filterFieldName: string;

  public toggleshowIt() {
    this.showIt = !this.showIt;
  }
  //ids of chart expand
  public bandwidthOvertime1: any;
  public productivityOvertime1: any;
  public trafficActionOvertime1: any;
  public productivityPieChart: any;
  public trafficPieChart1: any;

  //cards Data
  public averageBandwidth: any;
  public bandwidthRate: any;
  public totalBandwidth: any;

  //charts data
  public productivityPieChartData: any = [];
  public productivityOverTime: any;
  public trafficActionPieChartData: any;
  public trafficChartData: any;

  constructor(private _http: HttpService,
    private router: Router,
    private dtPipe: DatePipe,
    private _auth: AuthService,
    public authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Overview`);
    this.fullStartDate = this.dtPipe.transform(
      '2022-10-24T10:00',
      'yyyy-MM-ddTHH:mm'
    );
    this.fullEndDate = this.dtPipe.transform(
      '2022-10-24T10:11',
      'yyyy-MM-ddTHH:mm'
    );
    // this.chartOverview();
    this.overviewDashboard();

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
    this.bandwidthOvertime1.setSize(window.innerWidth / 1.6, undefined)
    this.productivityPieChart.setSize(window.innerWidth / 4, undefined)
    this.productivityOvertime1.setSize(window.innerWidth / 2, undefined)
    this.trafficActionOvertime1.setSize(window.innerWidth / 2, undefined)
    this.trafficPieChart1.setSize(window.innerWidth / 4, undefined)
  }
  expand() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.3);
    this.bandwidthOvertime1.setSize(window.innerWidth / 1.3, undefined)
    this.productivityPieChart.setSize(window.innerWidth / 3.3, undefined)
    this.productivityOvertime1.setSize(window.innerWidth / 1.65, undefined)
    this.trafficActionOvertime1.setSize(window.innerWidth / 1.65, undefined)
    this.trafficPieChart1.setSize(window.innerWidth / 3.3, undefined)
  }

  printpre() {
    let request = {
      start: new Date(this.fullStartDate).toISOString(),
      end: new Date(this.fullEndDate).toISOString(),
    };

    console.log(request);
  }
  setho() {
    this.fromHours = 18;
  }

  overviewDashboard() {
    const target = "#overviewChart";
    $(target).show();
    if (
      new Date(this.fullStartDate).getTime() >=
      new Date(this.fullEndDate).getTime()
    ) {
      alert(
        'The Starting Date-Time should be greater than the ending Date-Time. Please Use Appropriate Data and Time Values'
      );
      return;
    }
    if (
      new Date(this.fullEndDate).getTime() -
      new Date(this.fullStartDate).getTime() <
      300000
    ) {
      alert(
        'The difference in Starting and Ending time must be atleast 10 minutes'
      );
      return;
    }
    this.loading = true;

    let request: any = {
      start: new Date(this.fullStartDate).toISOString(),
      end: new Date(this.fullEndDate).toISOString(),

    };
    if (this.useFilter) {
      request.filter = {
        "fieldValue": this.filterFieldName,
        "fieldType": this.filterFieldValue
      }
    }

    this._http.post('eql/overview', request).subscribe(
      (res) => {

        if (res.status) {
          this.onDismiss();
          // alert('Success');
          console.log(res)
          // this.averageBandwidth = res.data.AverageBandwidth;
          this.bandwidthRate = res.data.BandwidthRate;
          // if (this.bandwidthRate.raw > 1024) {
          //   let ab: any = this.bandwidthRate.raw / 1024
          //   this.bandwidthRate.text = ab.toFixed([3]) + ' GB';
          // }
          this.totalBandwidth = res.data.TotalBandwidth;
          if (this.totalBandwidth.raw > 1024) {
            let ab: any = this.totalBandwidth.raw / 1024
            this.totalBandwidth.text = ab.toFixed([3]) + ' GB';
          }
          this.bandwidthOvertime = res.data.BandWidthOverTime;
          this.productivityOverTime = res.data.ProductivityOverTime;
          this.productivityPieChartData = res.data.ProductivityPie;
          this.trafficActionPieChartData = res.data.TrafficActionsPie;
          this.trafficChartData = res.data.TrafficActionsOverTime
          this.chartOverview();
          this.createCharts()
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
    const target = "#overviewChart";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
  }

  // msToTime(duration: any) {
  //   var milliseconds = Math.floor((duration % 1000) / 100),
  //     seconds = Math.floor((duration / 1000) % 60),
  //     minutes = Math.floor((duration / (1000 * 60)) % 60),
  //     hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  //   hours = (hours < 10) ? 0 + hours : hours;
  //   minutes = (minutes < 10) ? 0 + minutes : minutes;
  //   seconds = (seconds < 10) ? 0 + seconds : seconds;

  //   return hours + ":" + minutes + ":" + seconds;
  // }


  //bandwidth chart
  // filterTypeChartSeries(){  
  //   console.log('hsd')
  // }

  setBandwidthLineChartData(widget: string, bytes: string = 'MB', type: string = 'Chart') {
    let self = this;
    let chartOptions = {
      accessibility: {
        description: "Protocol"
      },
      chart: {
        zoomType: 'x',
        plotShadow: false,
        backgroundColor: 'snow',
        height: 350,
        // events:{
        //   click: function(evt:any){
        //     console.log(evt)
        //     console.log(this)
        //   }
        // } 
      },
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // timezone: 'Asia/Calcutta',
        useUTC: false,
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
          text: 'Bandwidth (MBs)',
        },
      },
      title: {
        text: type,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
        // text: type
        
      },
      tooltip: {
        // pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
        formatter: function () {
          // console.log(this)
          let bandwidthMB: any = this;
          var text = bandwidthMB.y;
          if (text > 1024) {
            return '<b>' + text / 1024 + ' GB </b>';
          }
          else {
            return '<b>' + text + ' MB</b>';
          }
        }
      },

      // shared: true
      // tooltip: {
      //   // pointFormat: 
      //   pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      // },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          events: {
            // click: function (event) {
            //   console.log('@@@@', event)
            //   console.log('######', this)
            //   self.filterTypeChartSeries(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            legendItemClick: function (event) {
              self.filterTypeChartSeries(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.filterTypeChartSeries(),
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
      series: [],
    };

    if (widget === 'bandwidth-chart-band') {
      this.BandwidthOverTimeChartData = chartOptions;
    }
    // var data= { "notification": { "title": "Hello World" }, "to": "/topics/user_123" };
    // const response = fetch("https://192.168.3.76/", {
    //   method: 'POST',
    //   body: data,
    //   headers: {'Content-Type': 'application/json'} 
    // });


  }

  //productivity chart

  setPieChartData(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    let self = this;
    let chartData = {
      accessibility: {
        description: "Productivity"
      },
      chart: {
        //  plotBorderWidth: null,
        type: 'pie',
        plotShadow: false,
        backgroundColor: 'snow',
        height: 350
      },
      title: {
        text: title,
       
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
      },
      tooltip: {
        // pointFormat:
        // '{series.name}: <b>{point.y} ' +
        // bytes +
        // ' ({point.percentage:.1f}%) </b>',

        formatter: function () {
          let a: any = this;
          var duration = a.y;

          // msToTime(duration: any) {
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
          // }

          // var milliseconds = Math.floor((duration % 1000) / 100),
          //   seconds = Math.floor((duration / 1000) % 60),
          //   minutes = Math.floor((duration / (1000 * 60)) % 60),
          //   hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

          // hours = (hours < 10) ? 0 + hours : hours;
          // minutes = (minutes < 10) ? 0 + minutes : minutes;
          // seconds = (seconds < 10) ? 0 + seconds : seconds;



        },
      },
      credits: {
        enabled: false,
      },
      // yAxis: {
      //   labels: {
      //     format: '${value}',
      //     title: {
      //       text: 'Thousands',
      //     },
      //   },
      // },
      // plotOptions: {
      //   pie: {
      //     innerSize: 200,
      //     depth: 45,
      //       dataLabels: {
      //           enabled: false,
      //       }
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
          //   //   self.filterTypeChartSeries(event, this);
          //   //   // self.filterFieldValue = event.point.series.name;
          //   // },

          //   show: function (event) {
          //     console.log(event);
          //     console.log(this);
          //     self.filterTypeChartSeries(event, this);
          //     return false;
          //     // if (!confirm('The series is currently ' +
          //     //              visibility + '. Do you want to change that?')) {
          //     //     
          //     // }
          //   }
          //   // clicking: this.filterTypeChartSeries(),
          // }
        },
        pie: {
          innerSize: 75,
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
            //   self.filterTypeChartSeries(event, this);
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

            // click: function (event) {
            //   console.log(event);
            //   console.log(this);
            //   self.filterTypeChartSeries(event, this);
            //   return false;
            //   // if (!confirm('The series is currently ' +
            //   //              visibility + '. Do you want to change that?')) {
            //   //     
            //   // }
            // }
            // clicking: this.filterTypeChartSeries(),
          }
        },
      },

      // plotOptions: {
      //   series: {
      //     events: {
      //       click: function (event) {
      //         console.log('%%%', event)
      //         console.log('######', this)
      //         self.filterTypeChartSeries(event, this);
      //         // self.filterFieldValue = event.point.series.name;
      //       },

      //       legendItemClick: function (event) {
      //         self.filterTypeChartSeries(event, this);
      //         return false;
      //         // if (!confirm('The series is currently ' +
      //         //              visibility + '. Do you want to change that?')) {
      //         //     
      //         // }
      //       }
      //       // clicking: this.filterTypeChartSeries(),
      //     }
      //   },
      //   // line:{
      //   // custom:"Protocol",
      //   // accessibility:{
      //   //   description: "dsahgh",
      //   //   enabled: true
      //   // }

      //   // }
      // },
      series: [
        // {
        //   type: 'pie',
        //   name: 'Brands',
        //   colorByPoint: true,
        //   data: [],
        // },
      ],
    };

    if (widget === 'productivity-pie') {
      this.TotalProductivityPieChart = chartData;
    }


  }

  //prod. line chart

  setLineChartData(widget: string, bytes: string = 'MB', type: string = 'Chart') {
    let self = this;
    let chartOptions = {
      accessibility: {
        description: "Productivity"
      },
      chart: {
        zoomType: 'x',
        plotShadow: false,
        backgroundColor: 'snow',
        height: 350,
        events: {
          click: function (evt: any) {
            console.log(evt)
          }
        }
      },
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // timezone: 'Asia/Calcutta',
        useUTC: false,
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
          text: 'Duration',
          

        },
      },
      title: {
        text: type,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
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

          // return a.series.name + ' : <b>' + hours + ":" + minutes + ":" + seconds + '</b>'
          // return hours + ":" + minutes + ":" + seconds;
          // // return
          // // return 'The value for <b>' + x +
          // //     '</b> is <b>' + this.y + '</b>';
          // return a.y;
        },
        // shared: true
      },
      // tooltip: {
      //   // pointFormat: 
      //   pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      // },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          events: {
            // click: function (event) {
            //   console.log('%%%', event)
            //   console.log('######', this)
            //   self.filterTypeChartSeries(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            legendItemClick: function (event) {
              self.filterTypeChartSeries(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.filterTypeChartSeries(),
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
      series: [],
    };
    if (widget === 'bandwidth-chart') {
      this.ProductivityOverTimeChartData = chartOptions;
    }

    // var data= { "notification": { "title": "Hello World" }, "to": "/topics/user_123" };
    // const response = fetch("https://192.168.3.76/", {
    //   method: 'POST',
    //   body: data,
    //   headers: {'Content-Type': 'application/json'} 
    // });


  }

  //traffic pie chart
  setTrafficPieChartData(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    let self = this;
    let chartData = {
      accessibility: {
        description: "TrafficAction"
      },
      chart: {
        //  plotBorderWidth: null,
        type: 'pie',
        plotShadow: false,
        backgroundColor: 'snow',
        height: 350
      },
      title: {
        text: title,
        
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
      },
      tooltip: {

      },
      credits: {
        enabled: false,
      },
      // yAxis: {
      //   labels: {
      //     format: '${value}',
      //     title: {
      //       text: 'Thousands',
      //     },
      //   },
      // },
      // plotOptions: {
      //   pie: {
      //     innerSize: 200,
      //     depth: 45,
      //       dataLabels: {
      //           enabled: false,
      //       }
      //   }
      // },
      plotOptions: {
        pie: {
          innerSize: 75,
          // depth: 45,

          // allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            // enabled: true,
            format: '<b>{point.percentage:.1f}%<b>',
            style: {
              fontSize: '10px',
            },
            // connectorShape: 'straight',
            // crookDistance: '70%',
          },
          showInLegend: true,
        },

        series: {
          events: {
            // click: function (event) {
            //   console.log('%%%', event)
            //   console.log('######', this)
            //   self.filterTypeChartSeries(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },
            // legendItemClick

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
            // click: function (event) {
            //   self.filterTypeChartSeries(event, this);
            //   return false;
            //   // if (!confirm('The series is currently ' +
            //   //              visibility + '. Do you want to change that?')) {
            //   //     
            //   // }
            // }
            // clicking: this.filterTypeChartSeries(),
          }
        },
        // line:{
        // custom:"Protocol",
        // accessibility:{
        //   description: "dsahgh",
        //   enabled: true
        // }

        // }

        // series: {
        //   states: {
        //     hover: {
        //       enabled: false,
        //     },
        //     inactive: {
        //       opacity: 1,
        //     },
        //   },
        // },
      },

      series: [
        // {
        //   type: 'pie',
        //   name: 'Brands',
        //   colorByPoint: true,
        //   data: [],
        // },
      ],
    };


    if (widget === 'top-action-pie-applications') {
      this.TrafficActionsPieChart = chartData;
    }

  }

  //trafic chart
  setTrafficChartData(widget: string, bytes: string = 'MB', type: string = 'Chart') {
    let self = this;
    let TrafficChart = {
      accessibility: {
        description: "TrafficAction"
      },
      chart: {
        zoomType: 'x',
        plotShadow: false,
        backgroundColor: 'snow',
        height: 350
      },
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // timezone: 'Asia/Calcutta',
        useUTC: false,
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
          text: 'Count'
        },
      },
      title: {
        text: type,
        
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
      },
      tooltip: {
        // pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          events: {
            // click: function (event) {
            //   console.log('%%%', event)
            //   console.log('######', this)
            //   self.filterTypeChartSeries(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            legendItemClick: function (event) {
              self.filterTypeChartSeries(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
            }
            // clicking: this.filterTypeChartSeries(),
          }
          // line:{
          // custom:"Protocol",
          // accessibility:{
          //   description: "dsahgh",
          //   enabled: true
          // }

          // }
        },
        // pie: {
        //   allowPointSelect: true,
        //   cursor: 'pointer',
        //   dataLabels: {
        //     enabled: true,
        //     format: '<b>{point.percentage:.1f}%<b>',
        //     style: {
        //       fontSize: '10px',
        //     },
        //     connectorShape: 'straight',
        //     crookDistance: '70%',
        //   },
        //   showInLegend: false,
        // },
        // area: {
        //   fillColor: {
        //     linearGradient: {
        //       x1: 0,
        //       y1: 0,
        //       x2: 0,
        //       y2: 1,
        //     },
        //     // stops: [
        //     //     [0, Highcharts.getOptions().colors[0]],
        //     //     [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
        //     // ]
        //   },
        //   marker: {
        //     radius: 2,
        //   },
        //   lineWidth: 1,
        //   states: {
        //     hover: {
        //       lineWidth: 1,
        //     },
        //   },
        //   threshold: null,
        // },
      },
      series: [
        {
          name: 'Year 1990',
          data: [631, 727, 3202, 72],
        },
      ],
    };
    if (widget === 'bandwidth-chart') {
      this.TrafficActionsOverTime = TrafficChart;
    }
  }



  // newf(chart: any) {
  //   console.log('bar callback');
  //   console.log(chart)
  //   console.log(window.innerWidth)
  //   chart.setSize(window.innerWidth/2,undefined)
  //   // let categoryHeight = 20;
  //   // chart.update({
  //   //   chart: {
  //   //     height:
  //   //       categoryHeight * chart.pointCount +
  //   //       (chart.chartHeight - chart.plotHeight),
  //   //     // (chart.chartHeight + chart.plotHeight),
  //   //     // chart.chartHeight,
  //   //   },
  //   // });
  // }

  // setColumnChartData(widget: string, bytes: string = 'MB') {
  //   let columnChartOption = {
  //     chart: {
  //       zoomType: 'x',
  //       backgroundColor: 'snow',
  //       type: 'column',
  //     },
  //     title: {
  //       text: 'Bandwidth Over Time'
  //     },
  //     xAxis: {
  //       title: {
  //         text: null
  //       }
  //     },
  //     yAxis: {

  //     },


  //     credits: {
  //       enabled: false
  //     },
  //     series: []
  //   }

  // }



  public chartOverview() {
    console.log('initializing charts');

    this.setBandwidthLineChartData('bandwidth-chart-band', 'MB', 'Bandwidth over Time');
    this.BandwidthOverTimeChartData['series'] = this.bandwidthOvertime;

    this.setPieChartData('productivity-pie', 'MB', 'Total Productivity');
    this.TotalProductivityPieChart['series'] = this.productivityPieChartData;

    this.setLineChartData('bandwidth-chart', 'MB', 'Productivity over Time');
    this.ProductivityOverTimeChartData['series'] = this.productivityOverTime;

    this.setTrafficPieChartData('top-action-pie-applications', 'MB', 'Traffic Actions');
    this.TrafficActionsPieChart['series'] = this.trafficActionPieChartData;

    this.setTrafficChartData('bandwidth-chart', 'MB', 'Traffic Actions over Time');
    this.TrafficActionsOverTime['series'] = this.trafficChartData;
  }
  createCharts() {
    // console.log(this.bandwidthOvertime)
    // console.log(this.BandwidthOverTimeChartData)
    this.bandwidthOvertime1 = Highcharts.chart('bandwidthOvertime1', this.BandwidthOverTimeChartData);

    // this.ProductivityOverTimeChartData.series = this.productivityOverTime;
    // console.log(this.ProductivityOverTimeChartData)
    this.productivityPieChart = Highcharts.chart('productivityPieChart', this.TotalProductivityPieChart);

    this.productivityOvertime1 = Highcharts.chart('productivityOvertime1', this.ProductivityOverTimeChartData);

    this.trafficPieChart1 = Highcharts.chart('trafficPieChart1', this.TrafficActionsPieChart);

    this.trafficActionOvertime1 = Highcharts.chart('trafficActionOvertime1', this.TrafficActionsOverTime);

    // console.log(this.productivityPieChartData )

  }
  filterTypeChartSeries(event: any, data: any) {
    // console.log(event);
    // console.log(data);
    // console.log('test event', event.point.y);
    // console.log('test data', data.name);
    // chart.options.accessibility.description
    // this.filterFieldValue = event.point.series.name;

    //legend click

    this.filterFieldName = data.name;
    this.filterFieldValue = data.chart.options.accessibility.description;
    let lk = data.options.custom;
    this.useFilter = true;
    this.overviewDashboard();
    // throw new Error('Function not implemented.');
  }

  filterTypePieChart(event: any, data:any){
    this.filterFieldValue = data.chart.options.accessibility.description;
    this.filterFieldName = event.point.name;
    this.useFilter = true;
    this.overviewDashboard();
  }
  resetFilters() {
    this.useFilter = false;
    this.overviewDashboard();
  }

}


