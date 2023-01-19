import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import HighchartsMore from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts';

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

  //ids of chart expand
  public topBlockedChartId: any;
  public topAccessingBlockedId: any;
  public topBlockedContentId: any;
  public topCategoryId: any;

  //chart Data

  public topBlockedApplicationsChartData: any;
  public topBlockedCategoriesChartData: any;
  public topBlockedSitesChartData: any;

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
    this.topBlockedChartId.setSize(window.innerWidth / 4, undefined)
    this.topAccessingBlockedId.setSize(window.innerWidth / 4, undefined)
    // this.topBlockedContentId.setSize(window.innerWidth / 4, undefined)
    this.topCategoryId.setSize(window.innerWidth / 4, undefined)
  }

  expand() {
    console.log(window.innerWidth);
    console.log(window.innerWidth / 1.3);
    this.topBlockedChartId.setSize(window.innerWidth /3.3, undefined)
    this.topAccessingBlockedId.setSize(window.innerWidth /3.4, undefined)
    // this.topBlockedContentId.setSize(window.innerWidth /3.3, undefined)
    this.topCategoryId.setSize(window.innerWidth /3.3, undefined)
  }


  dateTimeFilter() {
  
    let request = {
      start: new Date(this.startDate).toISOString(),
      end: new Date(this.endDate).toISOString(),
    };
    console.log(request);
  }
  

  overviewProtectionDashboard() {
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

    this._http.post('eql/protection', request).subscribe(
      async (res) => {
        if (res.status) {
          alert('Success');
          console.log(res)
      
          this.topBlockedApplicationsChartData = res.data.TopBlockedApplications;
          this.topBlockedCategoriesChartData = res.data.TopBlockedCategories;
          this.topBlockedSitesChartData = res.data.TopBlockedSites;
          // this.filterActionTableData = res.data
          // this.topUsersIpBarChartData = res.data.TopUsers;
          // this.topsitesColumnChartData = res.data.TopSites;
          // this.topDownloadTableData = res.data.TopDownloads;
          this.chartProtection();
          this.createProtectionCharts();
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
  setPieChartData(widget: string, bytes: string = 'MB', title: string = 'Chart') {
 
    let TopApplicationsChartData = {
      chart: {
        //  plotBorderWidth: null,
        type: 'pie',
        plotShadow: false,
        backgroundColor: 'snow',
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
        pie: {
          innerSize: 100,
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
    // if (widget === 'top-user-ips') {
    //   this.TopApplicationAccessingBlockedContent = TopApplicationsChartData;
    // }
    if (widget === 'top-user-ips-chart') {
      this.TopCategoriesOfBlockedContent = TopApplicationsChartData;
    }
  }

  public chartProtection() {
    console.log('initializing charts');

    this.setPieChartData('top-blocked-chart', 'MB', 'Top Blocked Applications');
    this.TopBlockedPieChartData['series'] = this.topBlockedApplicationsChartData.chart.Series;

    this.setPieChartData('top-user-ips', 'MB', 'Top Categories of Blocked Content');
    this.TopUserIpsAccessingBlockedContent['series'] = this.topBlockedCategoriesChartData.chart.Series;

    // this.setPieChartData('top-user-ips', 'MB');
    // this.TopApplicationAccessingBlockedContent['series'] = this.topPieChartData;

    this.setPieChartData('top-user-ips-chart', 'MB', 'Top Users Accessing Blocked Content');
    this.TopCategoriesOfBlockedContent['series'] = this.topBlockedSitesChartData.chart.Series;
  }

  createProtectionCharts(){
    this.topBlockedChartId = Highcharts.chart('topBlockedChartId', this.TopBlockedPieChartData)
    this.topAccessingBlockedId = Highcharts.chart('topAccessingBlockedId', this.TopUserIpsAccessingBlockedContent)
    // this.topBlockedContentId = Highcharts.chart('topBlockedContentId', this.TopApplicationAccessingBlockedContent)
    this.topCategoryId = Highcharts.chart('topCategoryId', this.TopCategoriesOfBlockedContent)
  }


}

