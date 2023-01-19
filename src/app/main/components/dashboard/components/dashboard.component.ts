import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnChanges, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import HighchartsMore from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';
// import $ from "jquery";

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

  public toggleshowIt(){
    this.showIt = !this.showIt;
  }
  //ids of chart expand
  public bandwidthOvertime1: any;
  public productivityOvertime1: any;
  public trafficActionOvertime1: any;
  public productivityPieChart: any;
  public trafficPieChart1: any;


  //charts data
  public productivityPieChartData:any = [];
  public productivityOverTime: any;
  public trafficActionPieChartData: any;
  public trafficChartData: any;

  // columnChart: any = [{
  //   name: 'Year 1990',
  //   data: [631, 727, 3202, 721, 426]
  // }, {
  //   name: 'Year 2000',
  //   data: [814, 841, 3714, 726, 331]
  // }, {
  //   name: 'Year 2010',
  //   data: [1044, 944, 4170, 735, 640]
  // }, {
  //   name: 'Year 2018',
  //   data: [1276, 1007, 4561, 746, 742]
  // }]
  // newData:any = [
  //   [1245466562000,45],
  //   [1245566562000,55],
  //   [1245666562000,65],
  //   [1245766562000,35],
  // ]


  barChartSeriesData: any = [{
    name: 'Brands',
    colorByPoint: true,
    data: [{
      name: 'Chrome',
      y: 80,
      sliced: true,
      selected: true
    }, {
      name: 'Edge',
      y: 50
    }, {
      name: 'Firefox',
      y: 5.67
    }, {
      name: 'Safari',
      y: 7.63
    }, {
      name: 'Internet Explorer',
      y: 3.53
    }, {
      name: 'Opera',
      y: 2.50
    }, {
      name: 'Sogou Explorer',
      y: 5.84
    }, {
      name: 'QQ',
      y: 9.51
    }, {
      name: 'Other',
      y: 8.6
    }, {
      name: 'Sogou Explorer',
      y: 4.84
    }]
  }]

  topPieChartData: any = [{
    name: 'Brands',
    // colorByPoint: true,
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

  barChart: any = [
    {
      name: 'Tokyo',
      data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
    },
    {
      name: 'New York',
      data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
    },
    {
      name: 'Berlin',
      data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
    }
  ]

 

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
    console.log('btn')
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
    this.productivityOvertime1.setSize(window.innerWidth / 1.6, undefined)
    this.trafficActionOvertime1.setSize(window.innerWidth / 2.65, undefined)
    this.productivityPieChart.setSize(window.innerWidth / 2.65, undefined)
    this.trafficPieChart1.setSize(window.innerWidth / 2.65, undefined)
  }
  expand() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.3);
    this.bandwidthOvertime1.setSize(window.innerWidth / 1.3, undefined)
    this.productivityOvertime1.setSize(window.innerWidth / 1.3, undefined)
    this.trafficActionOvertime1.setSize(window.innerWidth / 2.2, undefined)
    this.productivityPieChart.setSize(window.innerWidth / 2.2, undefined)
    this.trafficPieChart1.setSize(window.innerWidth / 2.2, undefined)
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

    this._http.post('eql/overview', request).subscribe(
      (res) => {
        if (res.status) {
          alert('Success');
          console.log(res)
      
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
  setTrafficChartData(widget: string, bytes: string = 'MB', type: string = 'Chart') {
    let TrafficChart = {
      chart: {
        zoomType: 'x',
        plotShadow: false,
        backgroundColor: 'snow',
      },
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // timezone: 'Asia/Calcutta',
        useUTC: false,
      },
      xAxis: {
        title: {
          text: 'date',
        },
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
      title: {
        text: type
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
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

  //pie chart data

  setPieChartData(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    
    let chartData = {
      chart: {
        //  plotBorderWidth: null,
        type: 'pie',
        plotShadow: false,
        backgroundColor: 'snow',
      },
      title: {
        text: title,
      },
      tooltip: {
        pointFormat:
          '{series.name}: <b>{point.y} ' +
          bytes +
          ' ({point.percentage:.1f}%) </b>',
      },
      credits: {
        enabled: false,
      },
      yAxis: {
        labels: {
          format: '${value}',
          title: {
            text: 'Thousands',
          },
        },
      },
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
          innerSize: 200,
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
        },
        series: {
          states: {
            hover: {
              enabled: false,
            },
            inactive: {
              opacity: 1,
            },
          },
        },
      },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: -10,
        y: 85,
        itemMarginTop: 5,
        itemDistance: 20,
      },
      series: [
        {
          type: 'pie',
          name: 'Brands',
          colorByPoint: true,
          data: [],
        },
      ],
    };
    if (widget === 'productivity-pie') {
      this.TotalProductivityPieChart = chartData;
    }
    if (widget === 'top-action-pie-applications') {
      this.TrafficActionsPieChart = chartData;
    }

  }


  setLineChartData(widget: string, bytes: string = 'MB', type: string = 'Chart') {
    

    let chartOptions = {
      chart: {
        zoomType: 'x',
        plotShadow: false,
        backgroundColor: 'snow',
      },
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // timezone: 'Asia/Calcutta',
        useUTC: false,
      },
      xAxis: {
        title: {
          text: 'date',
        },
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
      title: {
        text: type
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
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
      this.ProductivityOverTimeChartData = chartOptions;
    }
    if (widget === 'bandwidth-chart-band') {
      this.BandwidthOverTimeChartData = chartOptions;
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

  setColumnChartData(widget: string, bytes: string = 'MB') {
    let columnChartOption = {
      chart: {
        zoomType: 'x',
        backgroundColor: 'snow',
        type: 'column',
      },
      title: {
        text: 'Bandwidth Over Time'
      },
      xAxis: {
        title: {
          text: null
        }
      },
      yAxis: {
        // min: 0,
        // title: {
        //     text: 'Top Users IPs',
        //     align: 'high'
        // },
        // labels: {
        //     overflow: 'justify'
        // }
      },
      // tooltip: {
      //   valueSuffix: ' millions'
      // },
      // plotOptions: {
      //   bar: {
      //     dataLabels: {
      //       enabled: true
      //     }
      //   }
      // },

      credits: {
        enabled: false
      },
      series: []
    }
   
  }



  public chartOverview() {
    console.log('initializing charts');

    this.setLineChartData('bandwidth-chart', 'MB', 'Productivity over Time');
    this.ProductivityOverTimeChartData['series'] = this.productivityOverTime;

    this.setTrafficChartData('bandwidth-chart', 'MB', 'Traffic Actions over Time');
    this.TrafficActionsOverTime['series'] = this.trafficChartData;

    this.setPieChartData('productivity-pie', 'MB', 'Total Productivity');
    this.TotalProductivityPieChart['series'] = this.productivityPieChartData;

    this.setPieChartData('top-action-pie-applications', 'MB', 'Traffic Actions');
    this.TrafficActionsPieChart['series']= this.trafficActionPieChartData;

    this.setLineChartData('bandwidth-chart-band', 'MB', 'Bandwidth over Time');
    this.BandwidthOverTimeChartData['series'] = this.bandwidthOvertime;

  }
  createCharts(){
    // console.log(this.bandwidthOvertime)
    // console.log(this.BandwidthOverTimeChartData)
    this.bandwidthOvertime1 = Highcharts.chart('bandwidthOvertime1', this.BandwidthOverTimeChartData);
    // this.ProductivityOverTimeChartData.series = this.productivityOverTime;
    // console.log(this.ProductivityOverTimeChartData)
    this.productivityOvertime1 = Highcharts.chart('productivityOvertime1', this.ProductivityOverTimeChartData);
    this.trafficActionOvertime1 = Highcharts.chart('trafficActionOvertime1', this.TrafficActionsOverTime);
    
    // console.log(this.productivityPieChartData )
    this.productivityPieChart = Highcharts.chart('productivityPieChart', this.TotalProductivityPieChart);

    this.trafficPieChart1 = Highcharts.chart('trafficPieChart1', this.TrafficActionsPieChart);
  }

}

