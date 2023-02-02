import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import HighchartsMore from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';
import $ from "jquery";
@Component({
  selector: 'app-firewallProtection',
  templateUrl: './firewallProtection.component.html',
  styleUrls: ['./firewallProtection.component.css']
})
export class FirewallProtectionComponent implements OnInit {
  public loading = false;
  highcharts = Highcharts;
  public TopBlockedPieChartData: any = {};
  public TopUserIpsAccessingBlockedContent: any = {};
  public TopApplicationAccessingBlockedContent: any = {};
  public TopCategoriesOfBlockedContent: any = {};
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
  public topBlockedChartId: any;
  public topAccessingBlockedId: any;
  public topBlockedContentId: any;
  public topCategoryId: any;

  //chart Data

  public topBlockedApplicationsChartData: any;
  public topBlockedCategoriesChartData: any;
  public topBlockedSitesChartData: any;
  public topUserChartData: any;

  // table Data

  public filterActionTableData: any;


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
    this.authService.SetHeaderTitleName(`Firewall-Protection`);
    this.startDate = this.dtPipe.transform(
      '2022-10-24T10:00',
      'yyyy-MM-ddTHH:mm'
    );
    this.endDate = this.dtPipe.transform(
      '2022-10-24T10:11',
      'yyyy-MM-ddTHH:mm'
    );
    this.overviewProtectionDashboard();

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
    this.topBlockedChartId.setSize(window.innerWidth / 3.85, undefined)
    this.topCategoryId.setSize(window.innerWidth / 3.85, undefined)
    this.topBlockedContentId.setSize(window.innerWidth / 3.75, undefined)
    this.topAccessingBlockedId.setSize(window.innerWidth / 3.75, undefined)
  }

  expand() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.3);
    this.topBlockedChartId.setSize(window.innerWidth / 3.2, undefined)
    this.topCategoryId.setSize(window.innerWidth / 3.18, undefined)
    this.topBlockedContentId.setSize(window.innerWidth / 3.12, undefined)
    this.topAccessingBlockedId.setSize(window.innerWidth / 3.12, undefined)
  }


  dateTimeFilter() {

    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
    console.log(request);
  }


  overviewProtectionDashboard() {
    const target = "#protectionChart";
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
        // "fieldValue": this.filterFieldValue,
        // "fieldType": this.filterFieldName,
        "fieldValue": this.pieChartName,
        "fieldType": this.pieChartDescription,
      }
      // request.filter = {
      //   "fieldValue": this.filterFieldValue,
      //   "fieldType": this.filterFieldName
      // }
    }

    this._http.post('eql/protection', request).subscribe(
      async (res) => {
        if (res.status) {
          // alert('Success');
          this.onDismiss();
          console.log(res)

          this.topBlockedApplicationsChartData = res.data.TopBlockedApplications;
          this.topBlockedCategoriesChartData = res.data.TopBlockedCategories;
          this.topBlockedSitesChartData = res.data.TopBlockedSites;
          this.topUserChartData = res.data.TopBlockedUsers
          this.filterActionTableData = res.data.TopFilterActions;

          this.chartProtection();
          this.createProtectionCharts();
          this.IsOverviewCard = true;
        } else {
          this.loading = false;
          this.onDismiss();
          // alert('something is wrong');
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
    const target = "#protectionChart";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
  }

  //trafic chart
  setPieChartData(widget: string, bytes: string = 'MB', title: string = 'Chart', filterName: string = 'Filter') {
    let self = this;
    let TopApplicationsChartData = {
      accessibility: {
        description: filterName
      },
      chart: {
        //  plotBorderWidth: null,
        type: 'pie',
        plotShadow: false,
        backgroundColor: 'snow',
        height: 400
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
              self.filterTypeChartSeries(event, this);
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
      //     innerSize: 100,
      //     allowPointSelect: true,
      //     cursor: 'pointer',

      //     dataLabels: {
      //       enabled: true,
      //       format: '<b>{point.percentage:.1f}%<b>',
      //       style: {
      //         fontSize: '10px',
      //       },
      //       connectorShape: 'straight',
      //       crookDistance: '70%',
      //     },
      //     showInLegend: true,
      //   },
      //   series: {
      //     states: {
      //       hover: {
      //         enabled: false,
      //       },
      //       inactive: {
      //         opacity: 1,
      //       },
      //     },
      //   },
      // },
      // legend: {
      //   align: 'right',
      //   verticalAlign: 'top',
      //   layout: 'vertical',
      //   x: -10,
      //   y: 85,
      //   itemMarginTop: 5,
      //   itemDistance: 20,
      // },
      series: [

      ],
    };
    if (widget === 'top-blocked-chart') {
      this.TopBlockedPieChartData = TopApplicationsChartData;
    }
    if (widget === 'top-user-ips') {
      this.TopUserIpsAccessingBlockedContent = TopApplicationsChartData;
    }
    if (widget === 'top-user-ips-data') {
      this.TopApplicationAccessingBlockedContent = TopApplicationsChartData;
    }
    if (widget === 'top-user-ips-chart') {
      this.TopCategoriesOfBlockedContent = TopApplicationsChartData;
    }
  }

  public chartProtection() {
    console.log('initializing charts');

    this.setPieChartData('top-blocked-chart', 'MB', 'Top Applications Accessing Blocked Content', 'Application');
    this.TopBlockedPieChartData['series'] = this.topBlockedApplicationsChartData.chart.Series;

    this.setPieChartData('top-user-ips-chart', 'MB', 'Top Blocked Sites', 'Site');
    this.TopCategoriesOfBlockedContent['series'] = this.topBlockedSitesChartData.chart.Series;

    this.setPieChartData('top-user-ips-data', 'MB', 'Top Users Accessing Blocked Content', 'User');
    this.TopApplicationAccessingBlockedContent['series'] = this.topUserChartData.chart.Series;

    this.setPieChartData('top-user-ips', 'MB', 'Top Categories of Blocked Content', 'Category');
    this.TopUserIpsAccessingBlockedContent['series'] = this.topBlockedCategoriesChartData.chart.Series;


  }

  createProtectionCharts() {
    this.topBlockedChartId = Highcharts.chart('topBlockedChartId', this.TopBlockedPieChartData)
    this.topCategoryId = Highcharts.chart('topCategoryId', this.TopCategoriesOfBlockedContent)
    this.topBlockedContentId = Highcharts.chart('topBlockedContentId', this.TopApplicationAccessingBlockedContent)
    this.topAccessingBlockedId = Highcharts.chart('topAccessingBlockedId', this.TopUserIpsAccessingBlockedContent)
  }

  // outfun(event: any, data: any) {
  //   // console.log(event);
  //   // console.log(data);
  //   // console.log('test event', event.point.y);
  //   // console.log('test data', data.name);
  //   // chart.options.accessibility.description
  //   // this.filterFieldValue = event.point.series.name;

  //   //legend click

  //   this.filterFieldValue = data.name;
  //   this.filterFieldName = data.chart.options.accessibility.description;
  //   let lk = data.options.custom;
  //   this.useFilter = true;
  //   this.overviewProtectionDashboard();
  //   // throw new Error('Function not implemented.');
  // }
  filterTypeChartSeries(event: any, data: any) {
    this.pieChartName = event.point.name;  //10.10.101.10
    this.pieChartDescription = data.chart.options.accessibility.description; //application
    this.useFilter = true;
    this.overviewProtectionDashboard();
  }
  resetFilters() {
    this.useFilter = false;
    this.overviewProtectionDashboard();
  }


}

