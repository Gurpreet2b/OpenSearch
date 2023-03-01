import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { AuthService, HttpService } from 'src/app/core/services';
import { Subject } from 'rxjs/internal/Subject';
// import { MatDialog } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import domToPdf from 'dom-to-pdf';
import $ from 'jquery';

@Component({
  selector: 'app-NAS-Report',
  templateUrl: './NAS-Report.component.html',
  styleUrls: ['./NAS-Report.component.css'],
})
export class NASReportComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  public chartOptions: any;
  public chartOptionsLine: any;
  public OPTIONS: any = null;
  @ViewChild('content')
  // @ViewChild('appbysizechart')
  content!: ElementRef<any>;
  document: any;
  @ViewChild('generateReporting')
  modalTarget!: ElementRef<any>;
  private fetchReportID: any = '';
  private routeState: any;
  public showControls = true;


  @ViewChild('dialogRef')
  dialogRef!: TemplateRef<any>;

  @ViewChild('infoDialog')
  infoDialogRef!: TemplateRef<any>;

  @ViewChild('reportStart')
  reportStart!: any;

  constructor(
    public sanitizer: DomSanitizer,
    private _auth: AuthService,
    private _http: HttpService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dtPipe: DatePipe,
    private authService: AuthService,
    private activatedroute: ActivatedRoute,
    // public infoDialog: MatDialog
  ) {
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.routeState = this.router.getCurrentNavigation()?.extras.state;
      if (this.routeState) {
        this.fetchReportID = this.routeState.id;
      }
    }
    let options = {
      jsPDF: {
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        putOnlyUsedFonts: false,
        compress: false,
        precision: 2,
        userUnit: 1.0,
      },
      html2canvas: {
        allowTaint: false,
        backgroundColor: '#ffffff',
        canvas: null,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        logging: false,
        onclone: null,
        proxy: null,
        removeContainer: true,
        scale: window.devicePixelRatio,
        useCORS: false,
      },
    };
    this.OPTIONS = options;
  }

  form!: FormGroup;

  public loading = false;
  public myDatePicker: any = '';
  public myDatePickerFrom: any;
  public colorScheme: any = [];
  public valueSlid: any = '';
  public view: any = '';
  public view2: any = [];
  public useFirewallID = false;

  public latestReportInfo: any = {};
  public active: boolean = false;
  public report_view_title = '';
  public reportType = 'NAS';
  public userType = 'singleuser';
  public reportSource = 'Sophos Firewall';
  public allUsersType = 'allusers';
  public reportUser = '';
  public reportData_Overview: any;
  public reportData_Bandwidth: any;
  public filterActionTableData: any;
  public topDownloadTableData: any;
  public reportData_Blocked: any;
  public reportData_Warned: any;
  public reportData_Productivity: any;
  public reportData_Unacceptable: any;
  public reportData_Unproductive: any;
  public reportData_Acceptable: any;
  public reportData_Productive: any;
  // public reportDataReady = false;
  public reportDataReady = false;
  public IsDisabledReport = false;

  public additionalFiltersEnabled: boolean = true;
  public additionalFilterArray: any = [];
  public internetActivityArray: any = [];
  public securityNetworkArray: any = [];

  public SitesBySize: any = {};
  public SitesBySizeTable: any = {};
  public ApplicationBySize: any = {};
  public CategoryBySize: any = {};
  public ApplicationsTableData: any = {};
  public SitesTableData: any = {};

  public BandwidthOverTimeChartOptions: any = {};
  public SitesBySizeChartOptions: any = {};
  public ApplicationsBySizeChartOptions: any = {};
  public CategoriesBySizeChartOptions: any = {};
  public ProductivityOverTimeChartOptions: any = {};

  public ProductivityByBrowsingTimeChartOptions: any = {};

  public UnAcceptableApplicationsChartOptions: any = {};
  public AcceptableApplicationsChartOptions: any = {};
  public UnProductiveApplicationsChartOptions: any = {};
  public ProductiveApplicationsChartOptions: any = {};

  public UnAcceptableSitesChartOptions: any = {};
  public AcceptableSitesChartOptions: any = {};
  public UnProductiveSitesChartOptions: any = {};
  public ProductiveSitesChartOptions: any = {};

  public BlockedCategoriesChartOptions: any = {};
  public BlockedSitesChartOptions: any = {};
  public BlockedApplicationChartOptions: any = {};

  public WarnedAndProceededChartOptions: any = {};
  public WarnedCategoriesChartOptions: any = {};

  // All Users Variables
  // Bandwidth
  public AllBandwidthOverTimeChartOptions: any = {};
  public AllUsersBySizeChartOptions: any = {};
  public AllDepartmentsBySizeChartOptions: any = {};
  public AllSitesBySizeChartOptions: any = {};
  public AllApplicationsBySizeChartOptions: any = {};
  public AllCategoriesBySizeChartOptions: any = {};

  //Productivity
  public AllProductivityOverTimeChartOptions: any = {};
  public AllProductivityByBrowsingTimeChartOptions: any = {};
  public AllUsersBrowsingTime: any = {};
  public AllCategoriesByBrowsingTimeChartOptions: any = {};
  public AllTopProductivityTables: any = {};

  //Unacceptable
  public AllTopUnacceptableUsers: any = {};
  public AllUnAcceptableApplicationsChartOptions: any = {};
  public AllTopUnacceptableSitesChartOptions: any = {};
  // public AllTopUnacceptableApplications: any = {};

  //Unproductive
  public AllTopUnproductiveUsers: any = {};
  public AllTopUnproductiveSitesCleanOn: any = {};
  public AllTopUnproductiveSites: any = {};
  public AllTopUnproductiveApplications: any = {};

  //Acceptable
  public AllTopAcceptableUsers: any = {};
  public AllTopAcceptableSitesCleanOn: any = {};
  public AllTopAcceptableSites: any = {};
  public AllTopAcceptableApplications: any = {};

  //Productive
  public AllTopProductiveUsers: any = {};
  public AllTopProductiveSitesCleanOn: any = {};
  public AllTopProductiveSites: any = {};
  public AllTopProductiveApplications: any = {};

  //Blocked
  public AllBlockedSitesChartOptions: any = {};
  public AllBlockedEvents: any = {};
  public AllTopBlockedUsers: any = {};
  public AllBlockedCategories: any = {};

  //warned
  public AllWarnedEvent: any = {};
  public AllWarnedAndProcceded: any = {};
  public AllWarnedUsers: any = {};
  public AllWarnedCategoriesPieChartOption: any = {};

  public IsUserSelected: any = 'singleuser';
  public isActivityRadio: any = 'securityNetwork';
  public IsDropdownSelected: any;

  public chlabel: any;
  public chseries: any;
  public IsHideAllUsers: any = true;

  public meridian: any = 'AM';
  public hours: any = [];
  public minutes: any = [0];
  public fromMinutes: number = 0;
  public fromHours: number = 1;
  public toMinutes: number = 0;
  public toHours: number = 1;
  public chartOptionsBarGraph: any;
  public fullStartDate: any = new Date();
  public fullEndDate: any = new Date();
  windowScrolled: boolean = false;
  //dateFormat
  public endDateSetFormat: any;
  public startDateSetFormat: any;

  //ids of chart
  public bandwidthLineChart: any;
  public applicationsPieChart: any;
  // public CategoriesBySizePieChart: any;

  //NAS-REPORT ALL CHART DATA
  public AllFirewallActionsPieChartId: any = {};
  public AllFirewallPieChartData: any = {};
  public firewallActions_data: any;
  public AllFirewallActionOverTimeData: any = {};
  public firewallOvertime_data: any;
  public AllThreatsDetectedChartData: any = {};
  public threatsDetected_data: any;
  public AllNetworkConnectionChartData: any = {};
  public networkConnection_data: any;
  public AllNetworkCountriesChartData: any = {};
  public networkCountries_data: any;
  public AllDestinationIpChartData: any = {};
  public destinationIp_data: any;
  public AllInterfaceNetworkChartData: any = {};
  public interfaceNetwork_data: any;
  public AllSourceHostsAndMAcsChartData: any = {};
  public sourceHost_macs_data: any;
  public AllSourceIpChartData: any = {};
  public sourceIp_data: any;
  public AllUsersChartData: any = {};
  public networkUsers_data: any;
  public AllZoneNetworkChartData: any = {};
  public networkZone_data: any;
  public AllExceptionFirewallChartData: any = {};
  public firewallException_Data: any;
  public AllFirewallsChartData: any;
  public firewalls_data: any;

  public AllFilterActionsChartData: any = {};
  public filterAction_data: any;
  public AllRulesFirewallChartData: any = {};
  public firewallRules_data: any;
  public AllTopExcludedSitesChartData: any = {};
  public topExcludedSites_data: any;
  public AllAgentUserChartData: any = {};
  public userAgent_data: any;
  public AllUncategorizedChartData: any = {};
  public uncategorySites_data: any;
  // public AllUncategorizedSitesChartData: any = {};
  // public uncategorizedSite_data: any;
  public AllAcceptableSitesChartData: any = {};
  public acceptableSites_data: any;
  public AllBlockedApplicationsChartData: any = {};
  public blockedapplications_data: any;
  public AllBlockedCategoriesChartData: any = {};
  public blockedCategories_data: any;
  public AllBlockedPoliciesChartData: any = {};
  public blockedPolicies_data: any;
  public AllProductiveSitesChartData: any = {};
  public productiveSites_data: any;
  public AllUnacceptableSitesChartData: any = {};
  public unacceptableSites_data: any;
  public AllUnproductiveSitesChartData: any = {};
  public unproductiveSites_data: any;
  public AllBlockedUserAgentChartData: any = {};
  public blockedUserAgent_data: any;
  public AllBlockedUsersChartData: any = {};
  public blockedUser_data: any;
  public AllBlockedTrafficChartData: any = {};
  public blockedTraffic_data: any;
  public AllBlockedEventChartData: any = {};
  public blockedEvent_data: any;
  public AllWarnedAndProccededChartData: any = {};
  public warnedProcceded_data: any;
  public AllWarnedTrafficChartData: any = {};
  public warnedTraffic_data: any;
  public AllWarnedAndProccededEventChartData: any = {};
  public warnedProccededEvent_data: any;
  public AllWarnRulesChartData: any;
  public warnRules_data: any;
  public AllWarnedCategoriesChartData: any = {};
  public warnedCategories_data: any;
  public AllWarnedUserAgentChartData: any = {};
  public warnedUserAgent_data: any;
  public AllWarnedUsersChartData: any = {};
  public warnedUsers_data: any;
  public AllUnacceptableAppChartData: any;
  public unacceptableApp_data: any;
  public AllAllowedUnacceptableSitesChartData: any;
  public allowedUnacceptableSites_data: any;
  public AllAllowedUnacceptableUsersChartData: any;
  public allowedUnacceptableUsers_data: any;
  public AllAllowedUnproductiveApplicationsChartData: any = {};
  public unproductiveApplications_data: any;
  public AllAllowedUnproductiveUsersChartData: any;
  public unproductiveUsers_data: any;
  public AllAllowedUnproductiveSitesChartData: any;
  public unrpoductiveSites_data: any;
  public AllVPNFailedPieChartData: any;
  public VpnChart_data: any;
  public AllVPNSessionTypeChartData: any;
  public VpnSessionType_data: any;
  public AllVPNSessionsChartData: any;
  public VpnSessions_data: any;
  public AllVPNUsersChartData: any;
  public VPNUsers_data: any;

  subject: Subject<any> = new Subject();


  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`NAS Reporting`);
    this.fetchReportID = this.activatedroute.snapshot.params['id'] || 0;
    console.log(this.showControls);
    if (this.fetchReportID != '') {
      this.showControls = false;
      console.log('Fetching report with id', this.fetchReportID);
      this.fetchThisReport(this.fetchReportID);
    } else {
      console.log('No ID Specified');
    }
    // this.getLatestReportInfo();
    this.fullStartDate = this.dtPipe.transform(
      '2022-10-24T18:00',
      'yyyy-MM-ddTHH:mm'
    );
    // this.fullStartDate = this.dtPipe.transform(
    //   '2022-10-24T18:00',
    //   'yyyy-MM-ddTHH:mm'
    // );
    this.fullEndDate = this.dtPipe.transform(
      '2022-10-24T18:30',
      'yyyy-MM-ddTHH:mm'
    );
    // this._auth.reportingIsActive();

    Highcharts.setOptions({
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone: 'Asia/Calcutta',
      },
    });
    this.addFilter();
  }

  transform(seconds: number): string {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    var seconds = seconds - (hours * 3600) - (minutes * 60);

    var time = "";
    if (hours != 0) {
      time = hours + ":";
    }
    time += minutes + ":";
    if (seconds < 10) { time += "0"; }
    time += seconds;
    return time;

  }

  openDialog() {

  }

  scroll(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth' });
    // this.scrolldiv();
  }

  togg() {
    this.showControls = !this.showControls;
  }

  topFunction() {
    this.scroll(this.content.nativeElement);
  }
  userBasisChange(event: any) {
    console.log(event);
    this.useFirewallID = event.target.checked;

  }

  generatePdf = (contentName: any) => {
    const element = document.getElementById(contentName);
    const options = {
      filename: 'report.pdf',
      overrideWidth: 1250,
    };
    return domToPdf(element, options, () => {
      // callback function
    });
  };

  test() {
    // debugger;
    const target = "#loadLatestReport";
    // $(target).hide();
    console.log('########## test')

  }

  public async DownloadPDF(contentName: any) {
    const target = "#pdfDownload";
    $(target).show();

    await new Promise((f) => setTimeout(f, 3000));

    var data = document.getElementById(contentName) as HTMLElement;
    html2canvas(data).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(contentDataURL, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save('report.pdf'); // Generated PDF
      this.onDismiss();
    });
  }

  getLatestReportInfo() {
    this.loading = true;
    this._http.get('eql/reportsinfo/latest').subscribe(
      (res) => {
        if (res.status) {
          this.latestReportInfo = res.data;
          // this.endDateSetFormat = res.data.Report.EndDateISO;
          // this.startDateSetFormat = res.data.Report.StartDateISO;
          if (this.latestReportInfo.UserType === 'singleuser') {
            this.latestReportInfo.UserType = 'Single User';
          } else if (this.latestReportInfo.UserType === 'allusers') {
            this.latestReportInfo.UserType = 'All Users';
          }
          this.loading = false;
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          this.loading = false;
        } else {
          this.loading = false;
          alert(error.error.error);
        }
      }
    );
  }
  DownloadFromHTML() {
    let targetElm: any = this.content.nativeElement;
    let fileName = 'report';
    let totalHeight = targetElm.offsetHeight;
    const pdf = new jsPDF(
      this.OPTIONS.jsPDF.orientation,
      this.OPTIONS.jsPDF.unit,
      this.OPTIONS.jsPDF.format
    );
    const pdfWidth = pdf.internal.pageSize.width;
    const pdfHeight = pdf.internal.pageSize.height;
    // const margin = 0.1;
    // const pdfWidth = pdf.internal.pageSize.width * (1 - margin);
    // const pdfHeight = pdf.internal.pageSize.height * (1 - margin);
    // const dWidth = pdf.internal.pageSize.width * (margin / 2);
    // const dHeight = pdf.internal.pageSize.height * (margin / 2);
    window.scrollTo(0, 0);
    html2canvas(targetElm, this.OPTIONS.html2canvas).then((canvas) => {
      const widthRatio = pdfWidth / canvas.width;
      const sX = 0;
      // debugger;
      const sWidth = canvas.width;
      const sHeight =
        pdfHeight + (pdfHeight - pdfHeight * widthRatio) / widthRatio;
      const dX = 0;
      const dY = 0;
      const dWidth = sWidth;
      const dHeight = sHeight;
      let pageCnt = 1;
      while (totalHeight > 0) {
        totalHeight -= sHeight;
        let sY = sHeight * (pageCnt - 1);
        const childCanvas: any = document.createElement('CANVAS');
        childCanvas.setAttribute('width', sWidth.toString());
        childCanvas.setAttribute('height', sHeight.toString());
        const childCanvasCtx = childCanvas.getContext('2d');
        childCanvasCtx.drawImage(
          canvas,
          sX,
          sY,
          sWidth,
          sHeight,
          dX,
          dY,
          dWidth,
          dHeight
        );
        if (pageCnt > 1) {
          pdf.addPage();
        }
        pdf.setPage(pageCnt);
        pdf.addImage(
          childCanvas.toDataURL('image/png'),
          'PNG',
          0,
          0,
          canvas.width * widthRatio,
          0
        );
        pageCnt++;
      }
      if (fileName == null) {
        fileName = '';
      } else {
        fileName += '_';
      }
      fileName += this.getCurrentDateStr();
      pdf.save(fileName);
    });
    window.scrollTo(
      0,
      document.body.scrollHeight || document.documentElement.scrollHeight
    );
    this.onDismiss()
  }

  getCurrentDateStr() {
    const date = new Date();
    const yyyy = date.getFullYear().toString();
    const mm =
      date.getMonth() + 1 < 10
        ? '0' + date.getMonth() + 1
        : (date.getMonth() + 1).toString();
    const dd =
      date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString();
    const HH =
      date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString();
    const MM =
      date.getMinutes() < 10
        ? '0' + date.getMinutes()
        : date.getMinutes().toString();
    const SS =
      date.getSeconds() < 10
        ? '0' + date.getSeconds()
        : date.getSeconds().toString();
    return yyyy + mm + dd + HH + MM + SS;
  }

  chartCallback(chart: any) {
    console.log('bar callback dedicated function');
    let categoryHeight = 20;
    chart.update({
      chart: {
        height:
          categoryHeight * chart.pointCount +
          (chart.chartHeight - chart.plotHeight),
        // (chart.chartHeight + chart.plotHeight),
        // chart.chartHeight,
      },
    });
    // chart.setSize(null, 50 * chart.pointCount);
  }

  chartCallbackStacked(chart: any) {
    console.log('bar callback dedicated function stacked');
    console.log(chart);
    let categoryHeight = 20;
    console.log(chart.xAxis[0].categories.length);
    chart.update({
      chart: {
        height:
          categoryHeight * chart.xAxis[0].categories.length +
          (chart.chartHeight - chart.plotHeight),
        // chart.chartHeight,
      },
    });
    // chart.setSize(null, 50 * chart.pointCount);
  }
  setho() {
    this.fromHours = 18;
  }
  printpre() {
    let request = {
      start: new Date(this.fullStartDate).toISOString(),
      end: new Date(this.fullEndDate).toISOString(),
      type: this.reportType,
      user: this.reportUser,
    };
    console.log(request);
  }

  setUserType(val: any) {
    if (val === 'singleuser') {
      this.IsHideAllUsers = true;
      this.userType = val;
    } else {
      this.IsHideAllUsers = false;
      this.userType = val;
    }
    this.IsUserSelected = this.userType;
  }
  allActivityRadio(event: any) {
    this.isActivityRadio = event;
  }
  addFilter() {
    this.additionalFilterArray.push({});
  }

  removeAdditionalFilter(i: number) {
    this.additionalFilterArray.splice(i, 1);
  }
  OpenPopup() {
    this.loading = true;
  }

  generateOverallReport() {
    // <option>10.10.217.95</option>
    // <option>10.10.217.39</option>
    if (this.userType === 'singleuser' && !this.useFirewallID) {
      let ipformat =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (this.reportUser.trim() == '') {
        alert('Please Enter an IP for Report Generation');
        return;
      }
      if (!this.reportUser.match(ipformat)) {
        alert('Please Enter a Valid IP for Report Generation');
        return;
      }
    }
    if (this.useFirewallID && this.reportUser.trim() == '') {
      alert('Please Enter an ID for Report Generation');
      return;
    }

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
    // this.fullStartDate.setHours(this.fromHours, this.fromMinutes, 0);
    // this.fullEndDate.setHours(this.toHours, this.toMinutes, 0);
    let request: any = {
      start: new Date(this.fullStartDate).toISOString(),
      end: new Date(this.fullEndDate).toISOString(),
      type: this.userType,
      reporttype: this.reportType,
      // user: '',
    };
    if (this.useFirewallID) {
      request.user_id = this.reportUser;


      
    } else {
      if (this.userType == 'singleuser') {
        request.user = this.reportUser;
      } else {
        request.user = '';
      }
    }
    // this.openInfoDialog();
    this._http.post('eql/report', request).subscribe(
      async (res) => {
        if (res.status) {
          // this.onDismiss();
          this.loading = false;
          // alert('Success');

          // dateFormat

          this.IsUserSelected = this.userType;
          // this.reportData_Overview = res.data.Data.Widgets.Overview;
          // this.reportData_Bandwidth = res.data.Data.Widgets.Bandwidth;
          this.firewallActions_data = res.data.Data.Widgets.Overview;
          this.firewallOvertime_data = res.data.Data.Widgets.Overview;
          this.threatsDetected_data = res.data.Data.Widgets.Threats;
          this.networkConnection_data = res.data.Data.Widgets.Network;
          this.networkCountries_data = res.data.Data.Widgets.Network;
          this.destinationIp_data = res.data.Data.Widgets.Network;
          this.interfaceNetwork_data = res.data.Data.Widgets.Network;
          this.sourceHost_macs_data = res.data.Data.Widgets.Network;
          this.sourceIp_data = res.data.Data.Widgets.Network;
          this.networkUsers_data = res.data.Data.Widgets.Network;
          this.networkZone_data = res.data.Data.Widgets.Network;
          this.firewallException_Data = res.data.Data.Widgets.Firewall;
          this.firewalls_data = res.data.Data.Widgets.Firewall;
          this.filterAction_data = res.data.Data.Widgets.Firewall;
          this.firewallRules_data = res.data.Data.Widgets.Firewall;
          this.topExcludedSites_data = res.data.Data.Widgets.Firewall;
          this.userAgent_data = res.data.Data.Widgets.Firewall;
          this.uncategorySites_data = res.data.Data.Widgets.Firewall;
          // this.uncategorizedSite_data = res.data.Data.Widgets.Firewall;
          this.acceptableSites_data = res.data.Data.Widgets.BlockedTraffic;
          this.blockedapplications_data = res.data.Data.Widgets.BlockedTraffic;
          this.blockedCategories_data = res.data.Data.Widgets.BlockedTraffic;
          this.blockedPolicies_data = res.data.Data.Widgets.BlockedTraffic;
          this.productiveSites_data = res.data.Data.Widgets.BlockedTraffic;
          this.unacceptableSites_data = res.data.Data.Widgets.BlockedTraffic;
          this.unproductiveSites_data = res.data.Data.Widgets.BlockedTraffic;
          this.blockedUserAgent_data = res.data.Data.Widgets.BlockedTraffic;
          this.blockedUser_data = res.data.Data.Widgets.BlockedTraffic;
          this.blockedTraffic_data = res.data.Data.Widgets.BlockedTraffic;
          this.blockedEvent_data = res.data.Data.Widgets.BlockedTraffic;
          this.warnedProcceded_data = res.data.Data.Widgets.WarnedTraffic;
          this.warnedTraffic_data = res.data.Data.Widgets.WarnedTraffic;
          this.warnedProccededEvent_data = res.data.Data.Widgets.WarnedTraffic;
          this.warnRules_data = res.data.Data.Widgets.WarnedTraffic;
          this.warnedCategories_data = res.data.Data.Widgets.WarnedTraffic;
          this.warnedUserAgent_data = res.data.Data.Widgets.WarnedTraffic;
          this.warnedUsers_data = res.data.Data.Widgets.WarnedTraffic;
          this.unacceptableApp_data = res.data.Data.Widgets.AllowedTraffic;
          this.allowedUnacceptableSites_data = res.data.Data.Widgets.AllowedTraffic;
          this.allowedUnacceptableUsers_data = res.data.Data.Widgets.AllowedTraffic;
          this.unproductiveApplications_data = res.data.Data.Widgets.AllowedTraffic;
          this.unproductiveUsers_data = res.data.Data.Widgets.AllowedTraffic;
          this.unrpoductiveSites_data = res.data.Data.Widgets.AllowedTraffic;
          this.VpnChart_data = res.data.Data.Widgets.VPN;
          this.VpnSessionType_data = res.data.Data.Widgets.VPN;
          this.VpnSessions_data = res.data.Data.Widgets.VPN;
          this.VPNUsers_data = res.data.Data.Widgets.VPN;
          // this.filterActionTableData = res.data.Data.Widgets.Bandwidth;
          // this.topDownloadTableData = res.data.Data.Widgets.Bandwidth;
          // this.reportData_Blocked = res.data.Data.Widgets.Blocked;
          // this.reportData_Warned = res.data.Data.Widgets.Warned;
          // this.reportData_Productivity = res.data.Data.Widgets.Productivity;
          // this.reportData_Unacceptable = res.data.Data.Widgets.Unacceptable;
          // this.reportData_Unproductive = res.data.Data.Widgets.Unproductive;
          // this.reportData_Productive = res.data.Data.Widgets.Productive;
          // this.reportData_Acceptable = res.data.Data.Widgets.Acceptable;

          // this.ApplicationsTableData =
          //   res.data.Data.Widgets.Productivity.ApplicationsTableData;
          // this.SitesTableData =
          //   res.data.Data.Widgets.Productivity.SitesTableData;
          // this.AllTopProductivityTables =
          //   res.data.Data.Widgets['Productivity-Tables'];

          this.chartintialize(request.type);
          // this.reportingCharts();
          this.reportDataReady = true;
          this.IsDisabledReport = true;
          await new Promise((f) => setTimeout(f, 3000));
          this.onDismiss();
          this.scroll(this.content.nativeElement);
          // this.scroll(this.document.getElementById('content'))
        } else {
          this.loading = false;
          alert('something is wrong');
          // this.onDismiss();
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
  fetchThisReport(report_id: any) {
    this._http.get('eql/reportsinfo/' + report_id).subscribe(
      async (res) => {
        if (res.status) {
          this.loading = false;
          this.onDismiss();
          console.log('Fetched Report with an ID');
          // console.log(res)
          let rep = res.data.Report;

          // debugger;
          this.report_view_title =
            rep.ReportType +
            ' Report from ' +
            this.dtPipe.transform(rep.StartDateISO, 'medium') +
            ' to ' +
            this.dtPipe.transform(rep.EndDateISO, 'medium') +
            ' for User ' +
            rep.UserBasisValue;


          // alert('Success');
          // debugger;
          let dat = res.data.Data.Widgets;
          this.IsUserSelected = rep.UserType;
          // this.reportData_Bandwidth = dat.Bandwidth;
          this.firewallActions_data = dat.Overview;
          this.firewallOvertime_data = dat.Overview;
          this.threatsDetected_data = dat.Threats;
          this.networkConnection_data = dat.Network;
          this.networkCountries_data = dat.Network;
          this.destinationIp_data = dat.Network;
          this.interfaceNetwork_data = dat.Network;
          this.sourceHost_macs_data = dat.Network;
          this.sourceIp_data = dat.Network;
          this.networkUsers_data = dat.Network;
          this.networkZone_data = dat.Network;
          this.firewallException_Data = dat.Firewall;
          this.firewalls_data = dat.Firewall;
          this.filterAction_data = dat.Firewall;
          this.firewallRules_data = dat.Firewall;
          this.topExcludedSites_data = dat.Firewall;
          this.userAgent_data = dat.Firewall;
          this.uncategorySites_data = dat.Firewall;
          // this.uncategorizedSite_data = dat.Firewall;
          this.acceptableSites_data = dat.BlockedTraffic;
          this.blockedapplications_data = dat.BlockedTraffic;
          this.blockedCategories_data = dat.BlockedTraffic;
          this.blockedPolicies_data = dat.BlockedTraffic;
          this.productiveSites_data = dat.BlockedTraffic;
          this.unacceptableSites_data = dat.BlockedTraffic;
          this.unproductiveSites_data = dat.BlockedTraffic;
          this.blockedUserAgent_data = dat.BlockedTraffic;
          this.blockedUser_data = dat.BlockedTraffic;
          this.blockedTraffic_data = dat.BlockedTraffic;
          this.blockedEvent_data = dat.BlockedTraffic;
          this.warnedProcceded_data = dat.WarnedTraffic;
          this.warnedTraffic_data = dat.WarnedTraffic;
          this.warnedProccededEvent_data = dat.WarnedTraffic;
          this.warnRules_data = dat.WarnedTraffic;
          this.warnedCategories_data = dat.WarnedTraffic;
          this.warnedUserAgent_data = dat.WarnedTraffic;
          this.warnedUsers_data = dat.WarnedTraffic;
          this.unacceptableApp_data = dat.AllowedTraffic;
          this.allowedUnacceptableSites_data = dat.AllowedTraffic;
          this.allowedUnacceptableUsers_data = dat.AllowedTraffic;
          this.unproductiveApplications_data = dat.AllowedTraffic;
          this.unproductiveUsers_data = dat.AllowedTraffic;
          this.unrpoductiveSites_data = dat.AllowedTraffic;
          this.VpnChart_data = dat.VPN;
          this.VpnSessionType_data = dat.VPN;
          this.VpnSessions_data = dat.VPN;
          this.VPNUsers_data = dat.VPN;
          // this.reportData_Overview = dat.Overview;
          // this.reportData_Blocked = dat.Blocked;
          // this.filterActionTableData = dat.Bandwidth;
          // this.topDownloadTableData = dat.Bandwidth;
          // this.reportData_Warned = dat.Warned;
          // this.reportData_Productivity = dat.Productivity;
          // this.reportData_Unacceptable = dat.Unacceptable;
          // this.reportData_Unproductive = dat.Unproductive;
          // this.reportData_Productive = dat.Productive;
          // this.reportData_Acceptable = dat.Acceptable;

          // this.ApplicationsTableData = dat.Productivity.ApplicationsTableData;
          // this.SitesTableData = dat.Productivity.SitesTableData;
          // this.AllTopProductivityTables = dat['Productivity-Tables'];
          this.chartintialize(rep.UserType);
          // this.reportingCharts();
          // await new Promise((f) => setTimeout(f, 2000));
          this.reportDataReady = true;
          this.IsDisabledReport = true;
          await new Promise((f) => setTimeout(f, 2000));
          this.scroll(this.content.nativeElement);
          // this.onDismiss();
          // this.scroll(this.document.getElementById('content'))
        } else {
          this.loading = false;
          this.onDismiss();
          alert('something is wrong');
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
          alert(error.error.error);
          this.onDismiss();
        }
      }
    );
  }
  openpopup() {
    console.log(this.modalTarget);
    this.modalTarget.nativeElement.modal();
  }
  onDismiss() {
    const target = "#viewGenerateReport, #pdfDownload";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
    // const ele =  $('#viewGenerateReport');

    // $('#viewGenerateReport').modal('toggle')
    // ele.modal('toggle')
  }

  //PRODUCTIVITY OVER TIME CHART DATA

  setProductivityOverTimeChartDataStructure(widget: string, bytes: string = '') {
    let baseData = {
      chart: {
        zoomType: 'x',
        plotShadow: false,
        backgroundColor: 'transparent',
      },
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone: 'Asia/Calcutta',
        // useUTC: false,
      },
      xAxis: {
        title: {
          enabled: false
        },
        // title: {
        //   text: 'Date',
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
      title: {
        text: '',
      },
      // tooltip: {
      //   pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      // },

      tooltip: {
        formatter: function () {
          // debugger
          let a: any = this;
          var duration = a.y;
          var milliseconds = Math.floor((duration % 1000)),
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

          if (remaining_milliseconds < 10) {
            var milliseconds_time = "00" + str_milliseconds;
          }
          else if (remaining_milliseconds < 100) {
            var milliseconds_time = "0" + str_milliseconds;
          }
          else {
            var milliseconds_time = str_milliseconds.toString();
          }

          let thistime = new Date();
          thistime.setTime(a.x);
          return '<small>' + thistime.toUTCString() + '</small><br>' + a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + milliseconds_time + '</b>'

          // return  '<small>' + thistime.toUTCString() + '</small><br>' + a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + '</b>'


          // else {
          //   let thistime = new Date();
          //   thistime.setTime(bandwidthMB.x);
          //   return '<small>' + thistime.toUTCString() + '</small><br>' + bandwidthMB.series.name + ':<b>' + text + ' MB</b>';
          // }
          // return '<small>'+ thistime.toUTCString() +'</small><br>'+ a.series.name +':<b>' + duration + ' MB</b>';
          // if (milliseconds <10) {
          //     var str_milliseconds = "0" + milliseconds;
          // }
          // else {
          //     var str_milliseconds = milliseconds.toString();
          // }
          // pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
          // return  + ":" +  + ":" +  + "." + ;
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
        // {
        //   name: 'Year 1990',
        //   data: [631, 727, 3202, 72],
        // },
      ],
    };

    if (widget === 'productivity-overtime') {
      this.ProductivityOverTimeChartOptions = baseData;
    }

    //allUsers 
    if (widget === 'all-productivity-overtime') {
      this.AllProductivityOverTimeChartOptions = baseData;
    }

  }

  setLineChartBaseDataStructure(widget: string, bytes: string = '') {
    let baseData = {
      chart: {
        zoomType: 'x',
        plotShadow: false,
        backgroundColor: 'transparent',
      },
      time: {
        // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // timezone: 'Asia/Calcutta',
        useUTC: false,
      },
      xAxis: {
        title: {
          enabled: false
        },
        // title: {
        //   text: 'Date',
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
      title: {
        text: '',
      },

      tooltip: {
        // pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
        headerFormat: '<h1> {series.name} </h1>',
        formatter: function () {
          // console.log(this)
          let bandwidthMB: any = this;
          var text = bandwidthMB.y;
          if (text > 1024) {
            return '<b>' + text / 1024 + ' GB </b>';
          }
          else {
            let thistime = new Date();
            thistime.setTime(bandwidthMB.x);
            return '<small>' + thistime.toUTCString() + '</small><br>' + bandwidthMB.series.name + ':<b>' + text + ' MBs</b>';
          }
        }

        // formatter: () => {
        //   return this.points.reduce(function (s, point) {
        //     return s + '<br/>' + point.series.name + ': ' +
        //       point.y + 'm';
        //   }, '<b>' + this.x + '</b>');
        // },
        // shared: true
      },
      // tooltip: {
      //   pointFormat: '{series.name}: <b>{point.y} ' + bytes + '</b>',
      // },
      credits: {
        enabled: false,
      },
      // plotOptions: {
      //   // pie: {
      //   //   allowPointSelect: true,
      //   //   cursor: 'pointer',
      //   //   dataLabels: {
      //   //     enabled: true,
      //   //     format: '<b>{point.percentage:.1f}%<b>',
      //   //     style: {
      //   //       fontSize: '10px',
      //   //     },
      //   //     connectorShape: 'straight',
      //   //     crookDistance: '70%',
      //   //   },
      //   //   showInLegend: false,
      //   // },
      //   // area: {
      //   //   fillColor: {
      //   //     linearGradient: {
      //   //       x1: 0,
      //   //       y1: 0,
      //   //       x2: 0,
      //   //       y2: 1,
      //   //     },
      //   //     // stops: [
      //   //     //     [0, Highcharts.getOptions().colors[0]],
      //   //     //     [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
      //   //     // ]
      //   //   },
      //   //   marker: {
      //   //     radius: 2,
      //   //   },
      //   //   lineWidth: 1,
      //   //   states: {
      //   //     hover: {
      //   //       lineWidth: 1,
      //   //     },
      //   //   },
      //   //   threshold: null,
      //   // },
      // },
      series: [
        // {
        //   name: 'Year 1990',
        //   data: [631, 727, 3202, 72],
        // },
      ],
    };

    // if (widget === 'productivity-overtime') {
    //   this.ProductivityOverTimeChartOptions = baseData;
    // }
    // if (widget === 'bandwidth-overtime') {
    //   this.BandwidthOverTimeChartOptions = baseData;
    // }
    // All Users Line Charts
    if (widget === 'all-firewall-overtime') {
      this.AllFirewallActionOverTimeData = baseData;
    }
    if (widget === 'all-Vpn-sessions') {
      this.AllVPNSessionsChartData = baseData;
    }
    // if (widget === 'all-productivity-overtime') {
    //   this.AllProductivityOverTimeChartOptions = baseData;
    // }
  }

  //UNPRODUCITVITE APPLICATIONS BY BROWSING TIME

  setUnproductiveBarChartBaseDataStructure(widget: string) {
    let baseData = {
      chart: {
        type: 'bar',
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
        text: '',
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
      // tooltip: {
      //   valueSuffix: ' MB',
      // },
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

          if (remaining_milliseconds < 10) {
            var milliseconds_time = "00" + str_milliseconds;
          }
          else if (remaining_milliseconds < 100) {
            var milliseconds_time = "0" + str_milliseconds;
          }
          else {
            var milliseconds_time = str_milliseconds.toString();
          }
          // if (milliseconds <10) {
          //     var str_milliseconds = "0" + milliseconds;
          // }
          // else {
          //     var str_milliseconds = milliseconds.toString();
          // }

          // return  + ":" +  + ":" +  + "." + ;
          return a.point.category + '<br>' + a.series.name + ':<b>' + '</b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + milliseconds_time + '</b>'
          // return a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + '</b>'
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

    if (widget === 'all-threats-detected') {
      this.AllThreatsDetectedChartData = baseData;
    }

  }

  //UNPRODUCTIVE SITES BY BROWSING TIME STACKED CHART 

  setUnproductiveSitesBarChartDataStructure(widget: string) {
    let baseData = {
      chart: {
        type: 'bar',
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
        text: '',
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
          enabled: false
        },
        // title: {
        //   text: 'Bandwidth',
        //   align: 'high',
        // },
        labels: {
          format: '{value:%H:%M:%S}',
        },
        // labels: {
        //   overflow: 'justify',
        // },
      },
      // tooltip: {
      //   valueSuffix: ' MB',
      // },

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

          if (remaining_milliseconds < 10) {
            var milliseconds_time = "00" + str_milliseconds;
          }
          else if (remaining_milliseconds < 100) {
            var milliseconds_time = "0" + str_milliseconds;
          }
          else {
            var milliseconds_time = str_milliseconds.toString();
          }
          // if (milliseconds <10) {
          //     var str_milliseconds = "0" + milliseconds;
          // }
          // else {
          //     var str_milliseconds = milliseconds.toString();
          // }
          // a.point.category +'<br>' +  

          // return  + ":" +  + ":" +  + "." + ;
          return a.point.category + '<br>' + a.series.name + ':<b>' + '</b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + milliseconds_time + '</b>'
          // return a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + '</b>'
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

    if (widget === 'productivity-unproductive-sites') {
      this.UnProductiveSitesChartOptions = baseData;
    }

    //AllUsers 

    if (widget === 'AllUsers-Browsing-Time') {
      this.AllUsersBrowsingTime = baseData;
    }

    if (widget === 'AllUnproductive-Users') {
      this.AllTopUnproductiveUsers = baseData;
    }

    if (widget === 'AllUnproductive-Applications') {
      this.AllTopUnproductiveApplications = baseData;
    }

    if (widget === 'AllAcceptable-Users') {
      this.AllTopAcceptableUsers = baseData;
    }

    if (widget === 'AllAcceptable-Applications') {
      this.AllTopAcceptableApplications = baseData;
    }

  }

  //ACCEPTABLE SITES BY BROWSING TIME 

  setAcceptableBarChartDataStructure(widget: string) {
    let baseData = {
      chart: {
        type: 'bar',
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
        text: '',
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
        // labels: {
        //   overflow: 'justify',
        // },
        labels: {
          format: '{value:%H:%M:%S}',
        },
      },
      // tooltip: {
      //   valueSuffix: ' MB',
      // },
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

          if (remaining_milliseconds < 10) {
            var milliseconds_time = "00" + str_milliseconds;
          }
          else if (remaining_milliseconds < 100) {
            var milliseconds_time = "0" + str_milliseconds;
          }
          else {
            var milliseconds_time = str_milliseconds.toString();
          }


          // a.point.category +'<br>' +  

          // return  + ":" +  + ":" +  + "." + ;
          return a.point.category + '<br>' + a.series.name + ':<b>' + '</b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + milliseconds_time + '</b>'
          // return a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + str_milliseconds + '</b>'
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

    // if (widget === 'productivity-unproductive-sites') {
    //   this.UnProductiveSitesChartOptions = baseData;
    // }
    if (widget === 'productivity-acceptable-sites') {
      this.AcceptableSitesChartOptions = baseData;
    }

    if (widget === 'productivity-acceptable-applications') {
      this.AcceptableApplicationsChartOptions = baseData;
    }

  }

  setBarChartBaseDataStructure(widget: string) {
    let baseData = {
      chart: {
        type: 'bar',
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
        text: '',
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
    if (widget === 'bandwidth-sites') {
      this.SitesBySizeChartOptions = baseData;
    }
    if (widget === 'productivity-unacceptable-applications') {
      this.UnAcceptableApplicationsChartOptions = baseData;
    }
    // if (widget === 'productivity-unproductive-applications') {
    //   this.UnProductiveApplicationsChartOptions = baseData;
    // }
    // if (widget === 'productivity-acceptable-applications') {
    //   this.AcceptableApplicationsChartOptions = baseData;
    // }
    if (widget === 'productivity-productive-applications') {
      this.ProductiveApplicationsChartOptions = baseData;
    }

    if (widget === 'productivity-unacceptable-sites') {
      this.UnAcceptableSitesChartOptions = baseData;
    }
    // if (widget === 'productivity-unproductive-sites') {
    //   this.UnProductiveSitesChartOptions = baseData;
    // }
    // if (widget === 'productivity-acceptable-sites') {
    //   this.AcceptableSitesChartOptions = baseData;
    // }
    if (widget === 'productivity-productive-sites') {
      this.ProductiveSitesChartOptions = baseData;
    }
    //Allusers charts widget name
    // if (widget === 'AllUsers-Browsing-Time') {
    //   this.AllUsersBrowsingTime = baseData;
    // }
    if (widget === 'AllBlocked-Events') {
      this.AllBlockedEvents = baseData;
    }
    if (widget === 'AllWarned-Events') {
      this.AllWarnedEvent = baseData;
    }
    if (widget === 'AllWarned-Users') {
      this.AllWarnedUsers = baseData;
    }
  }
  setStackedBarChartBaseDataStructure(widget: string) {
    let baseData = {
      chart: {
        type: 'bar',
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
        text: '',
      },
      xAxis: {
        categories: [],
      },
      yAxis: {
        min: 0,
        title: {
          enabled: false
        },
        // title: {
        //   text: 'Bandwidth',
        //   align: 'high',
        // },
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

        // series: {
        //   pointWidth: 18,
        // },
        series: {
          stacking: 'normal',
          groupPadding: 0,
          pointPadding: 0,
        },
      },
      credits: {
        enabled: false,
      },
      series: [],
    };
    // pointWidth: 20,
    // bar: {
    //   dataLabels: {
    //     enabled: false,
    //   },
    // },

    if (widget === 'all-network-connection') {
      this.AllNetworkConnectionChartData = baseData;
    }

    if (widget === 'all-network-countries') {
      this.AllNetworkCountriesChartData = baseData;
    }

    if (widget === 'all-destination-ip') {
      this.AllDestinationIpChartData = baseData;
    }
    if (widget === 'all-interface-network') {
      this.AllInterfaceNetworkChartData = baseData;
    }
    if (widget === 'all-sourceHost-Macs-network') {
      this.AllSourceHostsAndMAcsChartData = baseData;
    }
    if (widget === 'all-source-ip') {
      this.AllSourceIpChartData = baseData;
    }
    if (widget === 'all-user-network') {
      this.AllUsersChartData = baseData;
    }
    if (widget === 'all-zone-network') {
      this.AllZoneNetworkChartData = baseData;
    }
    if (widget === 'all-unacceptable-application') {
      this.AllUnacceptableAppChartData = baseData;
    }
    if (widget === 'all-unacceptable-sites') {
      this.AllAllowedUnacceptableSitesChartData = baseData;
    }
    if (widget === 'all-unacceptable-users') {
      this.AllAllowedUnacceptableUsersChartData = baseData;
    }
    if (widget === 'all-unproductive-applications') {
      this.AllAllowedUnproductiveApplicationsChartData = baseData;
    }
    if (widget === 'all-unproductive-users') {
      this.AllAllowedUnproductiveUsersChartData = baseData;
    }
    if (widget === 'all-unproductive-sites') {
      this.AllAllowedUnproductiveSitesChartData = baseData;
    }
    if (widget === 'all-Vpn-session-type') {
      this.AllVPNSessionTypeChartData = baseData;
    }
    if (widget === 'all-Vpn-users') {
      this.AllVPNUsersChartData = baseData;
    }



    // All Users by bar chart Start

    // if (widget === 'all-sites-by-size') {
    //   this.AllSitesBySizeChartOptions = baseData;
    // }
    //unacceptable
    // if (widget === 'Allproductivity-unacceptable-users') {
    //   this.AllTopUnacceptableUsers = baseData;
    // }
    // if (widget === 'Allproductivity-unacceptable-applications') {
    //   this.AllUnAcceptableApplicationsChartOptions = baseData;
    // }
    // if (widget === 'Allproductivity-unacceptable-sites') {
    //   this.AllTopUnacceptableSitesChartOptions = baseData;
    // }
    // if (widget === 'AllUnacceptable-Sites-CleanOn') {
    //   this.AllTopUnproductiveSitesCleanOn = baseData;
    // }
    // if (widget === 'AllUnacceptable-Sites-CleanOff') {
    //   this.AllTopUnproductiveSitesCleanOff = baseData;
    // }
    //unproductive
    // if (widget === 'AllUnproductive-Users') {
    //   this.AllTopUnproductiveUsers = baseData;
    // }
    // if (widget === 'AllUnproductive-Applications') {
    //   this.AllTopUnproductiveApplications = baseData;
    // }
    if (widget === 'AllUnproductive-Sites') {
      this.AllTopUnproductiveSites = baseData;
    }
    // if (widget === 'AllUnproductive-Sites-CleanOn') {
    //   this.AllTopUnproductiveSitesCleanOn = baseData;
    // }
    //acceptable
    // if (widget === 'AllAcceptable-Users') {
    //   this.AllTopAcceptableUsers = baseData;
    // }
    // if (widget === 'AllAcceptable-Applications') {
    //   this.AllTopAcceptableApplications = baseData;
    // }
    if (widget === 'AllAcceptable-Sites') {
      this.AllTopAcceptableSites = baseData;
    }
    // if (widget === 'AllAcceptable-Sites-CleanOn') {
    //   this.AllTopAcceptableSiteCleanOn = baseData;
    // }
    //productive
    if (widget === 'AllProductive-Users') {
      this.AllTopProductiveUsers = baseData;
    }
    if (widget === 'AllProductive-Applications') {
      this.AllTopProductiveApplications = baseData;
    }
    if (widget === 'AllProductive-Sites') {
      this.AllTopProductiveSites = baseData;
    }
    // if (widget === 'AllProductive-SitesOn') {
    //   this.AllTopProductiveSitesOn = baseData;
    // }
    //blocked
    // if (widget === 'AllBlocked-Events') {
    //   this.AllBlockedEvents = baseData;
    // }
    if (widget === 'AllBlocked-Users') {
      this.AllTopBlockedUsers = baseData;
    }
  }


  //PRODUCTIVITY BY BROWSING TIME 

  setProductivityByBrowsingTimePieChartDataStructure(widget: string, bytes: string = 'MB') {
    let baseData = {
      chart: {
        //  plotBorderWidth: null,
        type: 'pie',
        plotShadow: false,
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
      },
      // tooltip: {
      //   pointFormat:
      //     '{series.name}: <b>{point.y} ' +
      //     bytes +
      //     ' ({point.percentage:.1f}%) </b>',
      // },

      tooltip: {
        // pointFormat:
        // '{series.name}: <b>{point.y} ' +
        // bytes +
        // ' ({point.percentage:.1f}%) </b>',

        formatter: function () {
          let a: any = this;
          var duration = a.y;

          // msToTime(duration: any) {
          var milliseconds = Math.floor((duration % 1000)),
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





          // else {
          //   let thistime= new Date();
          //   thistime.setTime(bandwidthMB.x);
          //   return '<small>'+ thistime.toUTCString() +'</small><br>'+ bandwidthMB.series.name +':<b>' + text + ' MB</b>';
          // }

          var remaining_milliseconds = duration - ((hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000));
          var str_milliseconds = remaining_milliseconds.toString();

          if (remaining_milliseconds < 10) {
            var milliseconds_time = "00" + str_milliseconds;
          }
          else if (remaining_milliseconds < 100) {
            var milliseconds_time = "0" + str_milliseconds;
          }
          else {
            var milliseconds_time = str_milliseconds.toString();
          }
          // if (milliseconds <10) {
          //     var str_milliseconds = "0" + milliseconds;
          // }
          // else {
          //     var str_milliseconds = milliseconds.toString();
          // }

          // '{series.name}: <b>{point.y} ' + bytes + ' ({point.percentage:.1f}%) </b>',
          // return  + ":" +  + ":" +  + "." + ;
          return a.point.name + '<br>' + a.series.name + ' : <b>' + str_hours + ":" + str_minutes + ":" + str_seconds + '.' + milliseconds_time + ' (' + a.point.percentage.toFixed([3]) + ' % ) ' + '</b>'
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
        {
          type: 'pie',
          name: 'Brands',
          colorByPoint: true,
          data: [],
        },
      ],
    };

    if (widget === 'Productive-Browsing-Time') {
      this.ProductivityByBrowsingTimeChartOptions = baseData;
    }

    //allUsers

    if (widget === 'AllProductive-Browsing-Time') {
      this.AllProductivityByBrowsingTimeChartOptions = baseData;
    }

    if (widget === 'all-categories-by-browsing-time') {
      this.AllCategoriesByBrowsingTimeChartOptions = baseData;
    }

  }

  setPieChartBaseDataStructure(widget: string) {
    let baseData = {
      chart: {
        //  plotBorderWidth: null,
        type: 'pie',
        plotShadow: false,
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
      },
      tooltip: {
        pointFormat:
          '{series.name}: <b>{point.y} ' + ' ({point.percentage:.1f}%) </b>',
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
        {
          type: 'pie',
          name: 'Brands',
          colorByPoint: true,
          data: [],
        },
      ],
    };
    // if (widget === 'applications-bandwidth') {
    //   this.ApplicationsBySizeChartOptions = baseData;
    // }
    // // if (widget === 'Productive-Browsing-Time') {
    // //   this.ProductivityByBrowsingTimeChartOptions = baseData;
    // // }
    // if (widget === 'bandwidth-categories') {
    //   this.CategoriesBySizeChartOptions = baseData;
    // }
    // if (widget === 'blocked-categories') {
    //   this.BlockedCategoriesChartOptions = baseData;
    // }
    // if (widget === 'blocked-sites') {
    //   this.BlockedSitesChartOptions = baseData;
    // }
    // if (widget === 'blocked-applications') {
    //   this.BlockedApplicationChartOptions = baseData;
    // }
    // if (widget === 'warned-proceeded') {
    //   this.WarnedAndProceededChartOptions = baseData;
    // }
    // if (widget === 'warned-categories') {
    //   this.WarnedCategoriesChartOptions = baseData;
    // }

    // NAS-Report All Users by Pie chart Start

    if (widget === 'all-firewall-actions') {
      this.AllFirewallPieChartData = baseData;
    }
    if (widget === 'all-exception-firewall') {
      this.AllExceptionFirewallChartData = baseData;
    }
    if (widget === 'all-firewalls') {
      this.AllFirewallsChartData = baseData;
    }
    if (widget === 'all-filterAction-firewall') {
      this.AllFilterActionsChartData = baseData;
    }
    if (widget === 'all-rules-firewall') {
      this.AllRulesFirewallChartData = baseData;
    }
    if (widget === 'all-excluded-sites') {
      this.AllTopExcludedSitesChartData = baseData;
    }
    if (widget === 'all-agent-user') {
      this.AllAgentUserChartData = baseData;
    }
    if (widget === 'all-sites-uncategory') {
      this.AllUncategorizedChartData = baseData;
    }
    // if (widget === 'all-uncategorized-sites') {
    //   this.AllUncategorizedSitesChartData = baseData;
    // }
    if (widget === 'all-acceptable-sites') {
      this.AllAcceptableSitesChartData = baseData;
    }
    if (widget === 'all-blocked-applications') {
      this.AllBlockedApplicationsChartData = baseData;
    }
    if (widget === 'all-blocked-categories') {
      this.AllBlockedCategoriesChartData = baseData;
    }
    if (widget === 'all-blocked-policies') {
      this.AllBlockedPoliciesChartData = baseData;
    }
    if (widget === 'all-blocked-productive') {
      this.AllProductiveSitesChartData = baseData;
    }
    if (widget === 'all-blocked-unacceptable') {
      this.AllUnacceptableSitesChartData = baseData;
    }
    if (widget === 'all-blocked-unproductive') {
      this.AllUnproductiveSitesChartData = baseData;
    }
    if (widget === 'all-blocked-user-agent') {
      this.AllBlockedUserAgentChartData = baseData;
    }
    if (widget === 'all-blocked-user') {
      this.AllBlockedUsersChartData = baseData;
    }
    if (widget === 'all-blocked-traffic') {
      this.AllBlockedTrafficChartData = baseData;
    }
    if (widget === 'all-blocked-event') {
      this.AllBlockedEventChartData = baseData;
    }
    if (widget === 'all-warned-procceded') {
      this.AllWarnedAndProccededChartData = baseData;
    }
    if (widget === 'all-warned-traffic') {
      this.AllWarnedTrafficChartData = baseData;
    }
    if (widget === 'all-warned-procceded-event') {
      this.AllWarnedAndProccededEventChartData = baseData;
    }
    if (widget === 'all-warned-rules') {
      this.AllWarnRulesChartData = baseData;
    }
    if (widget === 'all-warned-categories') {
      this.AllWarnedCategoriesChartData = baseData;
    }
    if (widget === 'all-warned-user-agent') {
      this.AllWarnedUserAgentChartData = baseData;
    }
    if (widget === 'all-warned-users') {
      this.AllWarnedUsersChartData = baseData;
    }
    if (widget === 'all-Vpn') {
      this.AllVPNFailedPieChartData = baseData;
    }
 
   
   
    

    // if (widget === 'all-department-by-size') {
    //   this.AllDepartmentsBySizeChartOptions = baseData;
    // }
    // if (widget === 'all-application-by-size') {
    //   this.AllApplicationsBySizeChartOptions = baseData;
    // }
    // if (widget === 'all-categories-by-size') {
    //   this.AllCategoriesBySizeChartOptions = baseData;
    // }
    // if (widget === 'all-categories-by-browsing-time') {
    //   this.AllCategoriesByBrowsingTimeChartOptions = baseData;
    // }
    // if (widget === 'AllProductive-Browsing-Time') {
    //   this.AllProductivityByBrowsingTimeChartOptions = baseData;
    // }
    if (widget === 'Allblocked-sites') {
      this.AllBlockedSitesChartOptions = baseData;
    }
    if (widget === 'AllBlocked-Categories') {
      this.AllBlockedCategories = baseData;
    }
    if (widget === 'AllWarned-Procceded') {
      this.AllWarnedAndProcceded = baseData;
    }
    if (widget === 'AllWarned-Categories') {
      this.AllWarnedCategoriesPieChartOption = baseData;
    }
  }
  public chartintialize(userType: string) {
    console.log('initializing charts');
    if (userType === 'singleuser') {
      //set bandwidth applicatios by size line chart
      // this.setLineChartBaseDataStructure('bandwidth-overtime', 'MB');
      // // this.BandwidthOverTimeChartOptions['series'][0]['data']=
      // //   this.reportData_Bandwidth.BandwidthOverTime.Chart.Series[0].data;

      // this.BandwidthOverTimeChartOptions['series'] =
      //   this.reportData_Bandwidth.BandwidthOverTime.Chart.Series;

      // this.BandwidthOverTimeChartOptions['xAxis']['categories'] =
      // this.reportData_Bandwidth.BandwidthOverTime.Chart.Labels;

      // this.setProductivityOverTimeChartDataStructure('productivity-overtime');
      // this.ProductivityOverTimeChartOptions['series'] =
      //   this.reportData_Productivity.ProductivityOverTime.Chart.Series;
      // // this.ApplicationsBySizeChartOptions['series'] = this.reportData_Bandwidth.ApplicationsBySize.Chart.Series;

      // //set Productive By Browsing Time pie chart
      // this.setProductivityByBrowsingTimePieChartDataStructure('Productive-Browsing-Time');
      // this.ProductivityByBrowsingTimeChartOptions['series'][0]['data'] =
      //   this.reportData_Productivity.ProductivityByBrowsingTime.Chart.Series[0].data;

      // this.setPieChartBaseDataStructure('applications-bandwidth');
      // this.ApplicationsBySizeChartOptions['series'] =
      //   this.reportData_Bandwidth.ApplicationsBySize.Chart.Series;
      // // this.ApplicationsBySizeChartOptions['series'][0]['data'] =
      // //   this.reportData_Bandwidth.ApplicationsBySize.Chart.Series[0].data;

      // // set bandwidth categories by size pie chartOptionsLine
      // this.setPieChartBaseDataStructure('bandwidth-categories');
      // this.CategoriesBySizeChartOptions['series'][0]['data'] =
      //   this.reportData_Bandwidth.CategoriesBySize.Chart.Series[0].data;

      // // set blocked categories by size pie chart
      // this.setPieChartBaseDataStructure('blocked-categories');
      // this.BlockedCategoriesChartOptions['series'][0]['data'] =
      //   this.reportData_Blocked.Categories.Chart.Series[0].data;

      // // set blocked sites by size pie chart
      // this.setPieChartBaseDataStructure('blocked-sites');
      // this.BlockedSitesChartOptions['series'][0]['data'] =
      //   this.reportData_Blocked.Sites.Chart.Series[0].data;

      // // set blocked Applications by size pie chart
      // this.setPieChartBaseDataStructure('blocked-applications');
      // this.BlockedApplicationChartOptions['series'][0]['data'] =
      //   this.reportData_Blocked.Applications.Chart.Series[0].data;

      // // set Warned and Proceeded by size pie chart
      // this.setPieChartBaseDataStructure('warned-proceeded');
      // this.WarnedAndProceededChartOptions['series'][0]['data'] =
      //   this.reportData_Warned.WarnedAndProceeded.Chart.Series[0].data;

      // // set Warned Categories by size pie chart
      // this.setPieChartBaseDataStructure('warned-categories');
      // this.WarnedCategoriesChartOptions['series'][0]['data'] =
      //   this.reportData_Warned.Categories.Chart.Series[0].data;

      // //set bandwidth sites by size bar chart
      // // if (this.SitesBySizeChartOptions.length > 0) {
      // //   this.SitesBySizeChartOptions = {};
      // // }
      // this.setBarChartBaseDataStructure('bandwidth-sites');
      // this.SitesBySizeChartOptions['xAxis']['categories'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      // this.SitesBySizeChartOptions['series'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Series;

      // this.setBarChartBaseDataStructure(
      //   'productivity-unacceptable-applications'
      // );
      // this.UnAcceptableApplicationsChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.UnacceptableApplicationsByBrowsingTime.Chart.Labels;
      // this.UnAcceptableApplicationsChartOptions['series'] =
      //   this.reportData_Productivity.UnacceptableApplicationsByBrowsingTime.Chart.Series;

      // this.setUnproductiveBarChartBaseDataStructure('productivity-unproductive-applications');
      // this.UnProductiveApplicationsChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.UnproductiveApplicationsByBrowsingTime.Chart.Labels;
      // this.UnProductiveApplicationsChartOptions['series'] =
      //   this.reportData_Productivity.UnproductiveApplicationsByBrowsingTime.Chart.Series;

      // this.setAcceptableBarChartDataStructure('productivity-acceptable-applications');
      // this.AcceptableApplicationsChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.AcceptableApplicationsByBrowsingTime.Chart.Labels;
      // this.AcceptableApplicationsChartOptions['series'] =
      //   this.reportData_Productivity.AcceptableApplicationsByBrowsingTime.Chart.Series;

      // this.setBarChartBaseDataStructure('productivity-productive-applications');
      // this.ProductiveApplicationsChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.ProductiveApplicationsByBrowsingTime.Chart.Labels;
      // this.ProductiveApplicationsChartOptions['series'] =
      //   this.reportData_Productivity.ProductiveApplicationsByBrowsingTime.Chart.Series;

      // this.setBarChartBaseDataStructure('productivity-unacceptable-sites');
      // this.UnAcceptableSitesChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.UnacceptableSitesByBrowsingTime.Chart.Labels;
      // this.UnAcceptableSitesChartOptions['series'] =
      //   this.reportData_Productivity.UnacceptableSitesByBrowsingTime.Chart.Series;

      // this.setUnproductiveSitesBarChartDataStructure('productivity-unproductive-sites');
      // this.UnProductiveSitesChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.UnproductiveSitesByBrowsingTime.Chart.Labels;
      // this.UnProductiveSitesChartOptions['series'] =
      //   this.reportData_Productivity.UnproductiveSitesByBrowsingTime.Chart.Series;

      // this.setAcceptableBarChartDataStructure('productivity-acceptable-sites');
      // this.AcceptableSitesChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.AcceptableSitesByBrowsingTime.Chart.Labels;
      // this.AcceptableSitesChartOptions['series'] =
      //   this.reportData_Productivity.AcceptableSitesByBrowsingTime.Chart.Series;

      // this.setBarChartBaseDataStructure('productivity-productive-sites');
      // this.ProductiveSitesChartOptions['xAxis']['categories'] =
      //   this.reportData_Productivity.ProductiveSitesByBrowsingTime.Chart.Labels;
      // this.ProductiveSitesChartOptions['series'] =
      //   this.reportData_Productivity.ProductiveSitesByBrowsingTime.Chart.Series;
    } else if (userType === 'allusers') {
      // // //All Users Graph chart Start

      //set Bandwidth Section Charts
      // this.setLineChartBaseDataStructure('all-bandwidth-overtime', 'MB');
      // this.AllBandwidthOverTimeChartOptions['series'] =
      //   this.reportData_Bandwidth.BandwidthOverTime.Chart.Series;



      // this.setStackedBarChartBaseDataStructure('all-sites-by-size');
      // this.AllSitesBySizeChartOptions['xAxis']['categories'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      // this.AllSitesBySizeChartOptions['series'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Series;
      // console.log(this.AllSitesBySizeChartOptions);
      // // //set applications by size pie chart
      // this.setPieChartBaseDataStructure('all-application-by-size');
      // this.AllApplicationsBySizeChartOptions['series'][0]['data'] =
      //   this.reportData_Bandwidth.ApplicationsBySize.Chart.Series[0].data;

      // // //set categories by size pie chart
      // this.setPieChartBaseDataStructure('all-categories-by-size');
      // this.AllCategoriesBySizeChartOptions['series'][0]['data'] =
      //   this.reportData_Bandwidth.CategoriesBySize.Chart.Series[0].data;


      // // //set departments by size pie chart
      // // this.setPieChartBaseDataStructure('all-department-by-size');
      // // this.AllDepartmentsBySizeChartOptions['series'][0]['data'] = this.reportData_Bandwidth.CategoriesBySize.Chart.Series[0].data;

      // // // //set Productivity Section Charts
      // this.setProductivityOverTimeChartDataStructure('all-productivity-overtime');
      // this.AllProductivityOverTimeChartOptions['series'] =
      //   this.reportData_Productivity.ProductivityOverTime.Chart.Series;

      // this.setProductivityByBrowsingTimePieChartDataStructure('AllProductive-Browsing-Time');
      // this.AllProductivityByBrowsingTimeChartOptions['series'][0]['data'] =
      //   this.reportData_Productivity.ProductivityByBrowsingTime.Chart.Series[0].data;

      // this.setProductivityByBrowsingTimePieChartDataStructure('all-categories-by-browsing-time');
      // this.AllCategoriesByBrowsingTimeChartOptions['series'][0]['data'] =
      //   this.reportData_Productivity.CategoriesByBrowsingTime.Chart.Series[0].data;

      // this.setUnproductiveSitesBarChartDataStructure('AllUsers-Browsing-Time');
      // this.AllUsersBrowsingTime['xAxis']['categories'] =
      //   this.reportData_Productivity.TopUsersByBrowsingTime.Chart.Labels;
      // this.AllUsersBrowsingTime['series'] =
      //   this.reportData_Productivity.TopUsersByBrowsingTime.Chart.Series;

      // // set Unacceptable Section charts data

      // this.setStackedBarChartBaseDataStructure(
      //   'Allproductivity-unacceptable-users'
      // );
      // this.AllTopUnacceptableUsers['xAxis']['categories'] =
      //   this.reportData_Unacceptable.TopUnacceptableUsers.Chart.Labels;
      // this.AllTopUnacceptableUsers['series'] =
      //   this.reportData_Unacceptable.TopUnacceptableUsers.Chart.Series;

      // this.setStackedBarChartBaseDataStructure(
      //   'Allproductivity-unacceptable-applications'
      // );
      // this.AllUnAcceptableApplicationsChartOptions['xAxis']['categories'] =
      //   this.reportData_Unacceptable.TopUnacceptableApplications.Chart.Labels;
      // this.AllUnAcceptableApplicationsChartOptions['series'] =
      //   this.reportData_Unacceptable.TopUnacceptableApplications.Chart.Series;

      // this.setStackedBarChartBaseDataStructure(
      //   'Allproductivity-unacceptable-sites'
      // );
      // this.AllTopUnacceptableSitesChartOptions['xAxis']['categories'] =
      //   this.reportData_Unacceptable.TopUnacceptableSites.Chart.Labels;
      // this.AllTopUnacceptableSitesChartOptions['series'] =
      //   this.reportData_Unacceptable.TopUnacceptableSites.Chart.Series;

      // //unproductive
      // this.setUnproductiveSitesBarChartDataStructure('AllUnproductive-Users');
      // this.AllTopUnproductiveUsers['xAxis']['categories'] =
      //   this.reportData_Unproductive.TopUnproductiveUsers.Chart.Labels;
      // this.AllTopUnproductiveUsers['series'] =
      //   this.reportData_Unproductive.TopUnproductiveUsers.Chart.Series;

      // this.setUnproductiveSitesBarChartDataStructure('AllUnproductive-Applications');
      // this.AllTopUnproductiveApplications['xAxis']['categories'] =
      //   this.reportData_Unproductive.TopUnproductiveApplications.Chart.Labels;
      // this.AllTopUnproductiveApplications['series'] =
      //   this.reportData_Unproductive.TopUnproductiveApplications.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllUnproductive-Sites');
      // this.AllTopUnproductiveSites['xAxis']['categories'] =
      //   this.reportData_Unproductive.TopUnproductiveSites.Chart.Labels;
      // this.AllTopUnproductiveSites['series'] =
      //   this.reportData_Unproductive.TopUnproductiveSites.Chart.Series;

      // // this.setStackedBarChartBaseDataStructure('AllUnproductive-Sites-CleanOn');
      // // this.AllTopUnproductiveSitesCleanOn['xAxis']['categories'] = this.reportData_Unproductive.TopUnproductiveUsers.Chart.Labels;
      // // this.AllTopUnproductiveSitesCleanOn['series'] = this.reportData_Unproductive.TopUnproductiveUsers.Chart.Series;

      // //Acceptable

      // this.setUnproductiveSitesBarChartDataStructure('AllAcceptable-Users');
      // this.AllTopAcceptableUsers['xAxis']['categories'] =
      //   this.reportData_Acceptable.TopAcceptableUsers.Chart.Labels;
      // this.AllTopAcceptableUsers['series'] =
      //   this.reportData_Acceptable.TopAcceptableUsers.Chart.Series;

      // this.setUnproductiveSitesBarChartDataStructure('AllAcceptable-Applications');
      // this.AllTopAcceptableApplications['xAxis']['categories'] =
      //   this.reportData_Acceptable.TopAcceptableApplications.Chart.Labels;
      // this.AllTopAcceptableApplications['series'] =
      //   this.reportData_Acceptable.TopAcceptableApplications.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllAcceptable-Sites');
      // this.AllTopAcceptableSites['xAxis']['categories'] =
      //   this.reportData_Acceptable.TopAcceptableSites.Chart.Labels;
      // this.AllTopAcceptableSites['series'] =
      //   this.reportData_Acceptable.TopAcceptableSites.Chart.Series;

      // // this.setStackedBarChartBaseDataStructure('AllAcceptable-Sites-CleanOn');
      // // this.AllTopAcceptableSiteCleanOn['xAxis']['categories'] =
      // //   this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      // // this.AllTopAcceptableSiteCleanOn['series'] =
      // //   this.reportData_Bandwidth.SitesBySize.Chart.Series;

      // //productive
      // this.setStackedBarChartBaseDataStructure('AllProductive-Users');
      // this.AllTopProductiveUsers['xAxis']['categories'] =
      //   this.reportData_Productive.TopProductiveUsers.Chart.Labels;
      // this.AllTopProductiveUsers['series'] =
      //   this.reportData_Productive.TopProductiveUsers.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllProductive-Applications');
      // this.AllTopProductiveApplications['xAxis']['categories'] =
      //   this.reportData_Productive.TopProductiveApplications.Chart.Labels;
      // this.AllTopProductiveApplications['series'] =
      //   this.reportData_Productive.TopProductiveApplications.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllProductive-Sites');
      // this.AllTopProductiveSites['xAxis']['categories'] =
      //   this.reportData_Productive.TopProductiveSites.Chart.Labels;
      // this.AllTopProductiveSites['series'] =
      //   this.reportData_Productive.TopProductiveSites.Chart.Series;

      // // this.setStackedBarChartBaseDataStructure('AllProductive-Sites-CleanOn');
      // // this.AllTopProductiveSitesOn['xAxis']['categories'] =
      // //   this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      // // this.AllTopProductiveSitesOn['series'] =
      // //   this.reportData_Bandwidth.SitesBySize.Chart.Series;

      // //Blocked

      // this.setBarChartBaseDataStructure('AllBlocked-Events');
      // this.AllBlockedEvents['xAxis']['categories'] =
      //   this.reportData_Blocked.BlockedEvents.Chart.Labels;
      // this.AllBlockedEvents['series'] =
      //   this.reportData_Blocked.BlockedEvents.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllBlocked-Users');
      // this.AllTopBlockedUsers['xAxis']['categories'] =
      //   this.reportData_Blocked.Users.Chart.Labels;
      // this.AllTopBlockedUsers['series'] =
      //   this.reportData_Blocked.Users.Chart.Series;

      // this.setPieChartBaseDataStructure('AllBlocked-Categories');
      // this.AllBlockedCategories['series'][0]['data'] =
      //   this.reportData_Blocked.Categories.Chart.Series[0].data;

      // //Warned and Proceeded

      // this.setBarChartBaseDataStructure('AllWarned-Events');
      // this.AllWarnedEvent['xAxis']['categories'] =
      //   this.reportData_Warned.WarnedEvents.Chart.Labels;
      // this.AllWarnedEvent['series'] =
      //   this.reportData_Warned.WarnedEvents.Chart.Series;

      // this.setPieChartBaseDataStructure('AllWarned-Procceded');
      // this.AllWarnedAndProcceded['series'][0]['data'] =
      //   this.reportData_Warned.WarnedAndProceeded.Chart.Series[0].data;

      // this.setBarChartBaseDataStructure('AllWarned-Users');
      // this.AllWarnedUsers['xAxis']['categories'] =
      //   this.reportData_Warned.Users.Chart.Labels;
      // this.AllWarnedUsers['series'] = this.reportData_Warned.Users.Chart.Series;

      // this.setPieChartBaseDataStructure('AllWarned-Categories');
      // this.AllWarnedCategoriesPieChartOption['series'][0]['data'] =
      //   this.reportData_Warned.Categories.Chart.Series[0].data;

      // this.setPieChartBaseDataStructure('Allblocked-sites');
      // this.AllBlockedSitesChartOptions['series'][0]['data'] = this.reportData_Blocked.Categories.Chart.Series[0].data;

      //NAS REPORT ALL USERS CHART DATA
      this.setPieChartBaseDataStructure('all-firewall-actions');
      this.AllFirewallPieChartData['series'] =
        this.firewallActions_data.FirewallActions.Chart.Series;

      this.setPieChartBaseDataStructure('all-Vpn');
      this.AllVPNFailedPieChartData['series'] =
        this.VpnChart_data.FailedVPNLogins.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-Vpn-session-type');
      this.AllVPNSessionTypeChartData['xAxis']['categories'] =
      this.VpnSessionType_data.VPNSessionTypes.Chart.Labels;
    this.AllVPNSessionTypeChartData['series'] =
      this.VpnSessionType_data.VPNSessionTypes.Chart.Series;

      this.setLineChartBaseDataStructure('all-Vpn-sessions');
      this.AllVPNSessionsChartData['series'] =
        this.VpnSessions_data.VPNSessions.Chart.Series;

        this.setStackedBarChartBaseDataStructure('all-Vpn-users');
        this.AllVPNUsersChartData['xAxis']['categories'] =
        this.VPNUsers_data.VPNUsers.Chart.Labels;
      this.AllVPNUsersChartData['series'] =
        this.VPNUsers_data.VPNUsers.Chart.Series;

      this.setLineChartBaseDataStructure('all-firewall-overtime', 'MB');
      this.AllFirewallActionOverTimeData['series'] =
        this.firewallOvertime_data.FirewallActionsOverTime.Chart.Series;

      this.setUnproductiveBarChartBaseDataStructure('all-threats-detected');
      this.AllThreatsDetectedChartData['xAxis']['categories'] =
        this.threatsDetected_data.ThreatsDetected.Chart.Labels;
      this.AllThreatsDetectedChartData['series'] =
        this.threatsDetected_data.ThreatsDetected.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-network-connection');
      this.AllNetworkConnectionChartData['xAxis']['categories'] =
        this.networkConnection_data.Connections.Chart.Labels;
      this.AllNetworkConnectionChartData['series'] =
        this.networkConnection_data.Connections.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-network-countries');
      this.AllNetworkCountriesChartData['xAxis']['categories'] =
        this.networkCountries_data.Countries.Chart.Labels;
      this.AllNetworkCountriesChartData['series'] =
        this.networkCountries_data.Countries.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-destination-ip');
      this.AllDestinationIpChartData['xAxis']['categories'] =
        this.destinationIp_data.DestinationIPs.Chart.Labels;
      this.AllDestinationIpChartData['series'] =
        this.destinationIp_data.DestinationIPs.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-interface-network');
      this.AllInterfaceNetworkChartData['xAxis']['categories'] =
        this.interfaceNetwork_data.Interfaces.Chart.Labels;
      this.AllInterfaceNetworkChartData['series'] =
        this.interfaceNetwork_data.Interfaces.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-sourceHost-Macs-network');
      this.AllSourceHostsAndMAcsChartData['xAxis']['categories'] =
        this.sourceHost_macs_data.SourceHostsAndMACs.Chart.Labels;
      this.AllSourceHostsAndMAcsChartData['series'] =
        this.sourceHost_macs_data.SourceHostsAndMACs.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-source-ip');
      this.AllSourceIpChartData['xAxis']['categories'] =
        this.sourceIp_data.SourceIPs.Chart.Labels;
      this.AllSourceIpChartData['series'] =
        this.sourceIp_data.SourceIPs.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-user-network');
      this.AllUsersChartData['xAxis']['categories'] =
        this.networkUsers_data.Users.Chart.Labels;
      this.AllUsersChartData['series'] =
        this.networkUsers_data.Users.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-zone-network');
      this.AllZoneNetworkChartData['xAxis']['categories'] =
        this.networkZone_data.Zones.Chart.Labels;
      this.AllZoneNetworkChartData['series'] =
        this.networkZone_data.Zones.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-unacceptable-application');
      this.AllUnacceptableAppChartData['xAxis']['categories'] =
        this.unacceptableApp_data.AllowedUnacceptableApplications.Chart.Labels;
      this.AllUnacceptableAppChartData['series'] =
        this.unacceptableApp_data.AllowedUnacceptableApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-unacceptable-sites');
      this.AllAllowedUnacceptableSitesChartData['xAxis']['categories'] =
        this.allowedUnacceptableSites_data.AllowedUnacceptableSites.Chart.Labels;
      this.AllAllowedUnacceptableSitesChartData['series'] =
        this.allowedUnacceptableSites_data.AllowedUnacceptableSites.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-unacceptable-users');
      this.AllAllowedUnacceptableUsersChartData['xAxis']['categories'] =
        this.allowedUnacceptableUsers_data.AllowedUnacceptableUsers.Chart.Labels;
      this.AllAllowedUnacceptableUsersChartData['series'] =
        this.allowedUnacceptableUsers_data.AllowedUnacceptableUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-unproductive-applications');
      this.AllAllowedUnproductiveApplicationsChartData['xAxis']['categories'] =
        this.unproductiveApplications_data.AllowedUnproductiveApplications.Chart.Labels;
      this.AllAllowedUnproductiveApplicationsChartData['series'] =
        this.unproductiveApplications_data.AllowedUnproductiveApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-unproductive-users');
      this.AllAllowedUnproductiveUsersChartData['xAxis']['categories'] =
        this.unproductiveUsers_data.AllowedUnproductiveUsers.Chart.Labels;
      this.AllAllowedUnproductiveUsersChartData['series'] =
        this.unproductiveUsers_data.AllowedUnproductiveUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-unproductive-sites');
      this.AllAllowedUnproductiveSitesChartData['xAxis']['categories'] =
        this.unrpoductiveSites_data.AllowedUnproductiveSites.Chart.Labels;
      this.AllAllowedUnproductiveSitesChartData['series'] =
        this.unrpoductiveSites_data.AllowedUnproductiveSites.Chart.Series;

      this.setPieChartBaseDataStructure('all-exception-firewall');
      this.AllExceptionFirewallChartData['series'] =
        this.firewallException_Data.Exceptions.Chart.Series;

      this.setPieChartBaseDataStructure('all-firewalls');
      this.AllFirewallsChartData['series'] =
        this.firewalls_data.Firewalls.Chart.Series;

      this.setPieChartBaseDataStructure('all-filterAction-firewall');
      this.AllFilterActionsChartData['series'] =
        this.filterAction_data.FilterActions.Chart.Series;

      this.setPieChartBaseDataStructure('all-rules-firewall');
      this.AllRulesFirewallChartData['series'] =
        this.firewallRules_data.Rules.Chart.Series;

      this.setPieChartBaseDataStructure('all-excluded-sites');
      this.AllTopExcludedSitesChartData['series'] =
        this.topExcludedSites_data.TopExcludedSites.Chart.Series;

      this.setPieChartBaseDataStructure('all-agent-user');
      this.AllAgentUserChartData['series'] =
        this.userAgent_data.TopUserAgents.Chart.Series;

      this.setPieChartBaseDataStructure('all-sites-uncategory');
      this.AllUncategorizedChartData['series'] =
        this.uncategorySites_data.UncategorizedSites.Chart.Series;


      this.setPieChartBaseDataStructure('all-acceptable-sites');
      this.AllAcceptableSitesChartData['series'] =
        this.acceptableSites_data.BlockedAcceptableSites.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-applications');
      this.AllBlockedApplicationsChartData['series'] =
        this.blockedapplications_data.BlockedApplications.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-categories');
      this.AllBlockedCategoriesChartData['series'] =
        this.blockedCategories_data.BlockedCategories.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-policies');
      this.AllBlockedPoliciesChartData['series'] =
        this.blockedPolicies_data.BlockedPolicies.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-productive');
      this.AllProductiveSitesChartData['series'] =
        this.productiveSites_data.BlockedProductiveSites.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-unacceptable');
      this.AllUnacceptableSitesChartData['series'] =
        this.unacceptableSites_data.BlockedUnacceptableSites.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-unproductive');
      this.AllUnproductiveSitesChartData['series'] =
        this.unproductiveSites_data.BlockedUnproductiveSites.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-user-agent');
      this.AllBlockedUserAgentChartData['series'] =
        this.blockedUserAgent_data.BlockedUserAgents.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-user');
      this.AllBlockedUsersChartData['series'] =
        this.blockedUser_data.BlockedUsers.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-traffic');
      this.AllBlockedTrafficChartData['series'] =
        this.blockedTraffic_data.MostBlockedTraffic.Chart.Series;

      this.setPieChartBaseDataStructure('all-blocked-event');
      this.AllBlockedEventChartData['series'] =
        this.blockedEvent_data.OtherBlockedEvents.Chart.Series;

      this.setPieChartBaseDataStructure('all-warned-procceded');
      this.AllWarnedAndProccededChartData['series'] =
        this.warnedProcceded_data.CategoriesWarnedAndProceeded.Chart.Series;

      this.setPieChartBaseDataStructure('all-warned-traffic');
      this.AllWarnedTrafficChartData['series'] =
        this.warnedTraffic_data.MostWarnedTraffic.Chart.Series;

      this.setPieChartBaseDataStructure('all-warned-procceded-event');
      this.AllWarnedAndProccededEventChartData['series'] =
        this.warnedProccededEvent_data.OtherWarnedAndProceededEvents.Chart.Series;

      this.setPieChartBaseDataStructure('all-warned-rules');
      this.AllWarnRulesChartData['series'] =
        this.warnRules_data.WarnRules.Chart.Series;

      this.setPieChartBaseDataStructure('all-warned-categories');
      this.AllWarnedCategoriesChartData['series'] =
        this.warnedCategories_data.WarnedCategories.Chart.Series;

      this.setPieChartBaseDataStructure('all-warned-user-agent');
      this.AllWarnedUserAgentChartData['series'] =
        this.warnedUserAgent_data.WarnedUserAgents.Chart.Series;

      this.setPieChartBaseDataStructure('all-warned-users');
      this.AllWarnedUsersChartData['series'] =
        this.warnedUsers_data.WarnedUsers.Chart.Series;


    }
    else {
      alert('An Error has occured while preparing charts')
    }

    // }
    // openDialog() {
    //   const myTempDialog = this.dialog.open(this.dialogRef, {
    //     width: '50vw',
    //   });
    //   myTempDialog.afterClosed().subscribe((result) => {
    //     console.log(result);
    //     if (result == 'true') {
    //       console.log('fetching latest');
    //       this.fetchThisReport(this.latestReportInfo.ID);
    //     }
    //   });
    // }
    // openInfoDialog() {
    //   const myTempDialog = this.infoDialog.open(this.infoDialogRef, {
    //     width: '50vw',
    //   });
    //   myTempDialog.afterClosed().subscribe((result) => {
    //     console.log(result);
    //     // if (result == 'true') {
    //     //   console.log('fetching latest');
    //     //   this.fetchThisReport(this.latestReportInfo.ID);
    //     // }
    //   });
    // }

  }

  // reportingCharts() {
  //   // this.bandwidthLineChart = Highcharts.chart('bandwidthLineChart', this.BandwidthOverTimeChartOptions);
  //   this.AllFirewallActionsPieChartId = Highcharts.chart('AllFirewallActionsPieChartId', this.AllFirewallPieChartData);
  // }

  adsghs() {

  }
}
