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
  public TopUsersIpsBar: any = {};
  public TopTrafficCategoriesPieChart: any = {};
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
  public topUsersIpBarId: any;
  public topTrafficCategoryId: any;
  public topUsersColumnChartId: any;
  public topSurfedColumnChartId: any;


  //chart Data
  public topAllowSitesPieChartData: any;
  public toptrafficCategoriesChartData: any;
  public topUsersIpBarChartData: any;
  public topUsersColumnChartData: any;
  public topSurfedColumnChartData: any;

  //table data
  public topDownloadTableData: any = [];

  topColumnChartData: any = []

  topBarChartData: any = []

  topPieChartData: any = []

  traffic: any = []

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
    this.topAllowedSiteId.setSize(window.innerWidth / 4, undefined)
    this.topUsersIpBarId.setSize(window.innerWidth / 2, undefined)
    this.topTrafficCategoryId.setSize(window.innerWidth / 4, undefined)
    this.topUsersColumnChartId.setSize(window.innerWidth / 2, undefined)
    this.topSurfedColumnChartId.setSize(window.innerWidth / 2, undefined)
  }

  expand() {
    this.topAllowedSiteId.setSize(window.innerWidth / 3.3, undefined)
    this.topUsersIpBarId.setSize(window.innerWidth / 1.7, undefined)
    this.topTrafficCategoryId.setSize(window.innerWidth / 3.3, undefined)
    this.topUsersColumnChartId.setSize(window.innerWidth / 1.7, undefined)
    this.topSurfedColumnChartId.setSize(window.innerWidth / 1.7, undefined)
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


    this._http.post('eql/edr', request).subscribe(
      async (res) => {
        if (res.status) {
          this.onDismiss();
          // alert('Success');
          console.log(res)

          this.topAllowSitesPieChartData = res.data.TopAllowedSites;
          this.toptrafficCategoriesChartData = res.data.TopAllowedSites;
          this.topUsersIpBarChartData = res.data.TopUsers;
          this.topUsersColumnChartData = res.data.TopUsers;
          this.topSurfedColumnChartData = res.data.TopSurfedSites;
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
        text: title
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
      },
      title: {
        text: title
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
        series: {
          events: {

            click: function (event) {
              console.log(event);
              console.log(this);
              self.filterTypeBarChart(event, this);
              return false;
          },
          
          }
        },
      },
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
        useHTML: true,
        text: `<span style="font-family:Nunito;">`+title +`</span>`
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
    if (widget === 'top-users') {
      this.TopUsersColumnChart = TopApplicationsColumnChartData;
    }
    if (widget === 'top-surfed-sites') {
      this.TopSurfedSiteColumnChart = TopApplicationsColumnChartData;
    }
  }


  public chartBandwidth() {
    console.log('initializing charts');

    this.setPieChartApplications('top-allowed-sites', 'MB', 'Top Allowed Websites', 'Application');
    this.TopAllowSites['series'] = this.topAllowSitesPieChartData.chart.Series;
    // this.TopTrafficCategoriesPieChart['series'] = this.topPieChartData;

    this.setPieChartApplications('top-traffic-applications', 'MB', 'Top Traffic Categories', 'Category');
    this.TopTrafficCategoriesPieChart['series'] = this.toptrafficCategoriesChartData.chart.Series;

    this.setBarChartApplications('top-bar-chart', 'MB', 'Top Users Ips');
    this.TopUsersIpsBar['xAxis']['categories'] = this.topUsersIpBarChartData.Labels;
    this.TopUsersIpsBar['series'] = this.topUsersIpBarChartData.Series;

    this.setColumnChartApplications('top-users', 'MB', 'Top Users');
    this.TopUsersColumnChart['xAxis']['categories'] = this.topUsersColumnChartData.chart.Labels;
    this.TopUsersColumnChart['series'] = this.topUsersColumnChartData.chart.Series;

    this.setColumnChartApplications('top-surfed-sites', 'MB', 'Top Surfed Sites');
    this.TopSurfedSiteColumnChart['xAxis']['categories'] = this.topSurfedColumnChartData.chart.Labels;
    this.TopSurfedSiteColumnChart['series'] = this.topSurfedColumnChartData.chart.Series;

  }

  createBandwidthCharts() {
    this.topAllowedSiteId = Highcharts.chart('topAllowedSiteId', this.TopAllowSites);
    this.topUsersIpBarId = Highcharts.chart('topUsersIpBarId', this.TopUsersIpsBar);
    this.topTrafficCategoryId = Highcharts.chart('topTrafficCategoryId', this.TopTrafficCategoriesPieChart)
    this.topUsersColumnChartId = Highcharts.chart('topUsersColumnChartId', this.TopUsersColumnChart)
    this.topSurfedColumnChartId = Highcharts.chart('topSurfedColumnChartId', this.TopSurfedSiteColumnChart)
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

