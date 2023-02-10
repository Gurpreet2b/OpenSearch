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
import $ from "jquery";
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
  public IsOverviewCard: any = false;

  public filterFieldValue: any;
  public useFilter: boolean = false;
  public filterFieldName: string;
  public pieChartName: string;
  public pieChartDescription: string;
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
  public topDownloadTableData: any = [];

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
    this.topApplicationId.setSize(window.innerWidth / 3.9, undefined)
    this.topUsersIpBarId.setSize(window.innerWidth / 1.85, undefined)
    this.topTrafficCategoryId.setSize(window.innerWidth / 3.9, undefined)
    this.topSitesColumnChartId.setSize(window.innerWidth / 1.85, undefined)
  }

  expand() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.3);
    this.topApplicationId.setSize(window.innerWidth / 3.2, undefined)
    this.topUsersIpBarId.setSize(window.innerWidth / 1.56, undefined)
    this.topTrafficCategoryId.setSize(window.innerWidth / 3.2, undefined)
    this.topSitesColumnChartId.setSize(window.innerWidth / 1.56, undefined)
  }

  dateTimeFilter() {
    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
    console.log(request);
  }

  overviewBandwidthDashboard() {
    const target = "#bandwidthChart";
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


    this._http.post('eql/bandwidth', request).subscribe(
      async (res) => {
        if (res.status) {
          this.onDismiss();
          // alert('Success');
          console.log(res)

          this.topApplicationPieChartData = res.data.TopApplications;
          this.toptrafficCategoriesChartData = res.data.TopCategories;
          this.topUsersIpBarChartData = res.data.TopUsers;
          this.topsitesColumnChartData = res.data.TopSites;
          this.topDownloadTableData = res.data.TopDownloads;
          this.chartBandwidth();
          this.createBandwidthCharts();
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
    const target = "#bandwidthChart";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");

  }


  //trafic chart
  setPieChartApplications(widget: string, bytes: string = 'MBs', title: string = 'Chart', filterName: string = 'Filter') {
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
          '<b>{point.y} ' +
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
          //   //   self.filterTypeBarChart(event, this);
          //   //   // self.filterFieldValue = event.point.series.name;
          //   // },

          //   show: function (event) {
          //     console.log(event);
          //     console.log(this);
          //     self.filterTypeBarChart(event, this);
          //     return false;
          //     // if (!confirm('The series is currently ' +
          //     //              visibility + '. Do you want to change that?')) {
          //     //     
          //     // }
          //   }
          //   // clicking: this.filterTypeBarChart(),
          // }
        },
        pie: {
          innerSize: 45,
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
    // let TopApplicationsChartData = {
    //   chart: {
    //     //  plotBorderWidth: null,
    //     type: 'pie',
    //     plotShadow: false,
    //     backgroundColor: 'snow',
    //   },
    //   title: {
    //     text: title
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
    //       innerSize: 20,
    //       allowPointSelect: true,
    //       cursor: 'pointer',

    //       dataLabels: {
    //         enabled: true,
    //         format: '<b>{point.percentage:.1f}%<b>',
    //         style: {
    //           fontSize: '10px',
    //         },
    //         connectorShape: 'straight',
    //         crookDistance: '100%',
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
    if (widget === 'top-applications') {
      this.TopApplications = TopApplicationsChartData;
    }
    if (widget === 'top-traffic-applications') {
      this.TopTrafficCategoriesPieChart = TopApplicationsChartData;
    }
  }

  setBarChartApplications(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    let self = this;
    let TopApplicationsBarChartData = {
      accessibility: {
        description: "User"
      },
      chart: {
        type: 'bar',
        backgroundColor: 'snow',
        height: 380
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
        valueSuffix: ' MBs',
      },
      plotOptions: {
        series: {
          events: {

            click: function (event) {
              console.log(event);
              console.log(this);
              self.filterTypeBarChart(event, this);
              return false;
          },
            // click: function (event) {
            //   console.log('@@@@', event)
            //   console.log('######', this)
            //   self.filterTypeBarChart(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            // legendItemClick: function (event) {
            //   console.log(event);
            //   console.log(this);
            //   self.filterTypeBarChart(event, this);
            //   return false;
            //   // if (!confirm('The series is currently ' +
            //   //              visibility + '. Do you want to change that?')) {
            //   //     
            //   // }
            // }
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
      // plotOptions: {
      //   series: {
      //     stacking: 'normal',
      //     dataLabels: {
      //       enabled: false
      //     }
      //   }
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
    if (widget === 'top-bar-chart') {
      this.TopUsersIpsBar = TopApplicationsBarChartData;
    }
  }

  setColumnChartApplications(widget: string, bytes: string = 'MB', title: string = 'Chart') {
    let self = this;
    let TopApplicationsColumnChartData = {
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
        text: title,
        style: {
          fontWeight: 'bold',
          fontSize: '16'
      }
        // useHTML: true,
        // text: `<span style="font-family:Nunito;">`+title +`</span>`
      },
      xAxis: {
        title: {
          text: null
        }
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
          events: {
            // click: function (event) {
            //   console.log('@@@@', event)
            //   console.log('######', this)
            //   self.filterTypeBarChart(event, this);
            //   // self.filterFieldValue = event.point.series.name;
            // },

            click: function (event) {
              self.filterTypeBarChart(event, this);
              return false;
              // if (!confirm('The series is currently ' +
              //              visibility + '. Do you want to change that?')) {
              //     
              // }
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
    if (widget === 'top-sites-applications') {
      this.TopSitesColumnChart = TopApplicationsColumnChartData;
    }
  }


  public chartBandwidth() {
    console.log('initializing charts');

    this.setPieChartApplications('top-applications', 'MBs', 'Top Applications', 'Application');
    this.TopApplications['series'] = this.topApplicationPieChartData.chart.Series;
    // this.TopTrafficCategoriesPieChart['series'] = this.topPieChartData;

    this.setPieChartApplications('top-traffic-applications', 'MBs', 'Top Traffic Categories', 'Category');
    this.TopTrafficCategoriesPieChart['series'] = this.toptrafficCategoriesChartData.chart.Series;

    this.setBarChartApplications('top-bar-chart', 'MBs', 'Top Users Ips');
    this.TopUsersIpsBar['xAxis']['categories'] = this.topUsersIpBarChartData.Labels;
    this.TopUsersIpsBar['series'] = this.topUsersIpBarChartData.Series;

    this.setColumnChartApplications('top-sites-applications', 'MBs', 'Top Sites');
    this.TopSitesColumnChart['xAxis']['categories'] = this.topsitesColumnChartData.chart.Labels;
    this.TopSitesColumnChart['series'] = this.topsitesColumnChartData.chart.Series;

  }

  createBandwidthCharts() {
    this.topApplicationId = Highcharts.chart('topApplicationId', this.TopApplications);
    this.topUsersIpBarId = Highcharts.chart('topUsersIpBarId', this.TopUsersIpsBar);
    this.topTrafficCategoryId = Highcharts.chart('topTrafficCategoryId', this.TopTrafficCategoriesPieChart)
    this.topSitesColumnChartId = Highcharts.chart('topSitesColumnChartId', this.TopSitesColumnChart)
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
    this.overviewBandwidthDashboard();
    // throw new Error('Function not implemented.');
  }
  filterTypePieChart(event: any, data:any){
    this.filterFieldName = data.chart.options.accessibility.description;
    this.filterFieldValue = event.point.name; 
    this.useFilter = true;
    this.overviewBandwidthDashboard();
  }
  resetFilters() {
    this.useFilter = false;
    this.overviewBandwidthDashboard();
  }

}

