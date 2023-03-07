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
  selector: 'app-AllActivity-Report',
  templateUrl: './AllActivity-Report.component.html',
  styleUrls: ['./AllActivity-Report.component.css'],
})
export class AllActivityReportMailComponent implements OnInit {
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
  public reportType = 'AA';
  public userType = 'singleuser';
  public reportSource = 'Sophos Firewall';
  public allUsersType = 'allusers';
  public reportUser = '';
  public AAReport_overview: any;
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


  //All Activity Chart Data

  public AcceptableAppChartData: any = {};
  public acceptableApp_data: any;
  public AcceptableSitesChartData: any = {};
  public acceptable_sites: any;
  public AcceptableUsersChartData: any = {};
  public acceptable_users: any;
  public AcceptableChartData: any = {};
  public acceptableTable_data: any;
  public unproductiveTable_data: any;
  public ProductiveUsersBrowsingTimeChartData: any = {};
  public productiveApp_data: any;
  public ProductiveSitesChartData: any = {};
  public productiveSites_data: any;
  public ProductiveUsersChartData: any = {};
  public productiveUsers_data: any;
  public ProductiveApplicationsChartData: any  ={};
  public acceptableSiteTable_data: any;
  public acceptableUsersTable_data: any;
  public productiveAppTable_data: any;
  public productiveSitesTable_data: any;
  public productiveUsersTable_data: any;
  public UnacceptableAppChartData: any = {};
  public unacceptableApp_data: any;
  public unacceptableAppTable_data: any;
  public UnacceptableSitesChartData: any = {};
  public unacceptableSites_data: any;
  public unacceptableSitesTable_data: any;
  public UnacceptableUsersChartData: any = {};
  public unacceptableUsers_data: any;
  public unacceptableUsersTable_data: any;
  public UnproductiveAppChartData: any = {};
  public unproductiveApp_data: any;
  public unproductiveAppTable_data: any;
  public UnproductiveSitesChartData: any = {};
  public unproductiveSites_data: any;
  public unproductiveUsers_data: any;
  public unproductiveSitesTable_data: any;
  public UnproductiveUsersChartData: any = {};
  public unproductiveUsersTable_data: any;
  public ApplicationBySizeChartData: any = {};
  public applicationSize_data: any;
  public BandwidthOverTimeChartData: any = {};
  public bandwidthOvertime_data: any;
  public BlockedApplicationChartData: any = {};
  public blockedApp_data: any;
  public BlockedCategoriesChartData: any = {};
  public blockedCategories_data: any;
  public BlockedSitesChartData: any = {};
  public blockedSites_data: any;
  public CategoriesBrowsingTimeChartData: any = {};
  public categoriesBrowsingTime_data: any;
  public DepartmentBySizeChartData: any = {};
  public departmentSize_data: any;
  public BlockedEventChartData: any = {};
  public blockedEvent_data: any;
  public ProductivityByBrowsingTimeChartData: any = {};
  public productivityBrowsing_data: any;
  public ProductivityOverTimeChartData: any = {};
  public productivityOverTime_data: any;
  public SitesBySizeChartData: any = {};
  public sitesBySize_data: any;
  public TopUsersBrowsingTimeChartData: any = {};
  public usersBrowsingTime_data: any;
  public TopUsersBySizeChartData: any = {};
  public userBySize_data: any;
  public warnedCategoriesChartData: any = {};
  public warnedCategories_data: any;
  public warnedUsersChartData: any = {};
  public warnedUser_data : any;
  public warnedProceededChartData: any = {};
  public warnedProceeded_data: any;
  public downloadedFiles_data: any;
  public firewallRulesTable_data: any;
  public UnacceptableApplicationsChartData: any = {};
  public unacceptableApplication_data: any;
  public AllowedUnacceptableSitesChartData: any;
  public allowedUnacceptableSites_data: any;
  public AllowedUnacceptableUsersChartData: any = {};
  public allowedUnacceptableUsers_data: any;
  public AllowedUnproductiveApplicationsChartData: any = {};
  public unproductiveApplications_data: any;
  public AllowedUnproductiveSitesChartData: any;
  public allowedUnproductiveSites_data: any;
  public AllowedUnproductiveUsersChartData: any = {};
  public allowedUnproductiveUsers_data: any;
  public BlockedAcceptableSitesChartData: any = {};
  public acceptableSites_data: any;
  public BlockedApplicationsChartData: any = {};
  public blockedApplications_data: any;
  public NASBlockedCategoriesChartData: any = {};
  public NASBlockedCategory_data: any;
  public BlockedPoliciesChartData: any = {};
  public blockedPolicies_data: any;
  public BlockedProductiveSitesChartData: any = {};
  public NASproductiveSites_data: any;
  public BlockedUnacceptableSitesChartData: any = {};
  public NASunacceptableSites_data: any;
  public BlockedUnproductiveSitesChartData: any = {};
  public NASunproductiveSites_data: any;
  public BlockedUserAgentChartData: any = {};
  public NASUserAgent_data: any;
  public BlockedUsersChartData: any = {};
  public blockedUser_data: any;
  public BlockedTrafficChartData: any = {};
  public blockedTraffic_data: any;
  public BlockedEventsChartData: any = {};
  public blockedEvents_data: any;
  public NetworkConnectionsChartData: any = {};
  public networkConnection_data: any;
  public NetworkCountriesChartData: any = {};
  public networkCountries_data: any;
  public NetworkDestinationIpChartData: any = {};
  public networkDestinationIp_data: any;
  public NetworkInterfacesChartData: any = {};
  public networkInterfaces_data: any;
  public SourceHostandMacsChartData: any = {};
  public sourceHostMacs_data: any;
  public SourceIpsChartData: any = {};
  public sourceIp_data: any;
  public NetworkUsersChartData: any = {};
  public networkUsers_data: any;
  public NetworkZonesChartData: any = {};
  public networkZones_data: any;
  public FirewallExceptionChartData: any = {};
  public firewallException_data: any;
  public FilterActionsChartData: any = {};
  public filterActions_data: any = {};
  // public FilterActionChartData: any = {};
  // public filterActions_data: any;
  public FirewallsChartData: any = {};
  public firewalls_data: any;
  public FirewallRulesChartData: any = {};
  public firewallRules_data: any;
  public TopExcludedSitesChartData: any = {};
  public excludedSites_data: any;
  public TopUserAgentChartData: any = {};
  public userAgent_data: any;
  public UncategorizedSitesChartData: any = {};
  public uncategorizedSites_data: any;
  public FirewallActionsChartData: any = {};
  public firewallActions_data: any;
  public FirewallActionOvertimeChartData: any = {};
  public firewallOvertime_data: any;
  public ThreatsDetectedChartData: any = {};
  public threatsDetected_data: any;
  public VPNLoginsChartData: any = {};
  public vpnLogins_data: any;
  public VPNSessionTypeChartData: any = {};
  public vpnSessionType_data: any;
  public VPNSessionsChartData: any = {};
  public vpnSessions_data: any;
  public VPNUsersChartData: any = {};
  public vpnUsers_data: any;
  public CategoriesWarnedProceededChartData: any = {};
  public WarnedProceeded_data: any;
  public warnedTrafficChartData: any = {};
  public warnedTraffic_data: any;
  public warnedProceededEventChartData: any = {};
  public warnedProceededEvent_data: any;
  public warnedRulesChartData: any = {};
  public warnRules_data: any;
  public WarnCategoriesChartData: any = {};
  public WarnCategories_data: any;
  public WarnedUserAgentChartData: any = {};
  public warnedUserAgent_data: any;
  public WarnedUsersChartData: any = {};
  public warnedUsers_data: any;
  public CategoriesByBrowsingTimeChartData: any = {};
  public categoriesTime_data: any;
  public warnedEventsChartData: any = {};
public warnedEvents_data: any;
public IUBlockedUsersChartData: any ={};
public blockUser_data: any;

  subject: Subject<any> = new Subject();

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`All Activity Reporting Mail`);
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
    // this.getLatestReportInfo();

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
          this.acceptableApp_data = res.data.Data.IU.Acceptable;
          this.acceptable_sites = res.data.Data.IU.Acceptable;
          this.acceptable_users = res.data.Data.IU.Acceptable;
          this.acceptableTable_data = res.data.Data.IU['Application-table'];
          this.unproductiveTable_data = res.data.Data.IU['Application-table'];
          this.productiveApp_data = res.data.Data.IU.Productivity;
          this.productiveSites_data = res.data.Data.IU.Productive;
          this.productiveUsers_data = res.data.Data.IU.Productive;
          this.acceptableSiteTable_data = res.data.Data.IU['Sites-table'];
          this.acceptableUsersTable_data = res.data.Data.IU['Users-table'];
          this.productiveAppTable_data = res.data.Data.IU['Application-table'];
          this.productiveSitesTable_data = res.data.Data.IU['Sites-table'];
          this.productiveUsersTable_data = res.data.Data.IU['Users-table'];
          this.unacceptableApp_data = res.data.Data.IU.Unacceptable;
          this.unacceptableAppTable_data = res.data.Data.IU['Application-table'];
          this.unacceptableSites_data = res.data.Data.IU.Unacceptable;
          this.unacceptableSitesTable_data = res.data.Data.IU['Sites-table'];
          this.unacceptableUsers_data = res.data.Data.IU.Unacceptable;
          this.unacceptableUsersTable_data = res.data.Data.IU['Users-table'];
          this.unproductiveApp_data = res.data.Data.IU.Unproductive;
          this.unproductiveAppTable_data = res.data.Data.IU['Application-table'];
          this.unproductiveSites_data = res.data.Data.IU.Unproductive;
          this.unproductiveUsers_data = res.data.Data.IU.Unproductive;
          this.unproductiveSitesTable_data = res.data.Data.IU['Sites-table'];
          this.unproductiveUsersTable_data = res.data.Data.IU['Users-table'];
          this.applicationSize_data = res.data.Data.IU.Bandwidth.ApplicationsBySize;
          this.bandwidthOvertime_data = res.data.Data.IU.Bandwidth.BandwidthOverTime;
          this.blockedApp_data = res.data.Data.IU.blocked;
          this.blockedCategories_data = res.data.Data.IU.Blocked;
          this.blockUser_data = res.data.Data.IU.Blocked;
          this.blockedSites_data = res.data.Data.IU.blocked;
          this.categoriesBrowsingTime_data = res.data.Data.IU.Bandwidth.CategoriesBySize;
          this.departmentSize_data = res.data.Data.IU.Bandwidth.DepartmentsBySize;
          this.blockedEvent_data = res.data.Data.IU.Blocked;
          this.productivityBrowsing_data = res.data.Data.IU.Productivity.ProductivityByBrowsingTime;
          this.productivityOverTime_data = res.data.Data.IU.Productivity.ProductivityOverTime;
          this.sitesBySize_data = res.data.Data.IU.Bandwidth.SitesBySize;
          this.usersBrowsingTime_data = res.data.Data.IU.top_users_by_browsing_time;
          this.userBySize_data = res.data.Data.IU.Bandwidth.UsersBySize;
          this.warnedCategories_data = res.data.Data.IU.Warned;
          this.warnedUser_data = res.data.Data.IU.Warned;
          this.warnedProceeded_data = res.data.Data.IU.Warned;
          this.warnedEvents_data = res.data.Data.IU.Warned;
          // this.warnedEvents_data = res.data.Data.IU.Warned;
          this.downloadedFiles_data = res.data.Data.IU.Bandwidth.DownloadedFiles;
          this.firewallRulesTable_data = res.data.Data.IU.Bandwidth.FirewallRules;
          this.unacceptableApplication_data = res.data.Data.NAS.AllowedTraffic;
          this.allowedUnacceptableSites_data = res.data.Data.NAS.AllowedTraffic;
          this.allowedUnacceptableUsers_data = res.data.Data.NAS.AllowedTraffic;
          this.unproductiveApplications_data = res.data.Data.NAS.AllowedTraffic;
          this.allowedUnproductiveSites_data = res.data.Data.NAS.AllowedTraffic;
          this.allowedUnproductiveUsers_data = res.data.Data.NAS.AllowedTraffic;
          this.acceptableSites_data = res.data.Data.NAS.BlockedTraffic;
          this.blockedApplications_data = res.data.Data.NAS.BlockedTraffic;
          this.NASBlockedCategory_data = res.data.Data.NAS.BlockedTraffic;
          this.blockedPolicies_data = res.data.Data.NAS.BlockedTraffic;
          this.NASproductiveSites_data = res.data.Data.NAS.BlockedTraffic;
          this.NASunacceptableSites_data = res.data.Data.NAS.BlockedTraffic;
          this.NASunproductiveSites_data = res.data.Data.NAS.BlockedTraffic;
          this.NASUserAgent_data = res.data.Data.NAS.BlockedTraffic;
          this.blockedUser_data = res.data.Data.NAS.BlockedTraffic;
          this.blockedTraffic_data = res.data.Data.NAS.BlockedTraffic;
          this.blockedEvents_data = res.data.Data.NAS.BlockedTraffic;
          this.networkConnection_data = res.data.Data.NAS.Network;
          this.networkCountries_data = res.data.Data.NAS.Network;
          this.networkDestinationIp_data = res.data.Data.NAS.Network;
          this.networkInterfaces_data = res.data.Data.NAS.Network;
          this.sourceHostMacs_data = res.data.Data.NAS.Network;
          this.sourceIp_data = res.data.Data.NAS.Network;
          this.networkUsers_data = res.data.Data.NAS.Network;
          this.networkZones_data = res.data.Data.NAS.Network;
          this.firewallException_data = res.data.Data.NAS.Firewall;
          this.filterActions_data = res.data.Data.NAS.Firewall;
          this.firewalls_data = res.data.Data.NAS.Firewall;
          this.firewallRules_data = res.data.Data.NAS.Firewall;
          this.excludedSites_data = res.data.Data.NAS.Firewall;
          this.userAgent_data = res.data.Data.NAS.Firewall;
          this.uncategorizedSites_data = res.data.Data.NAS.Firewall;
          this.firewallActions_data = res.data.Data.NAS.Overview;
          this.firewallOvertime_data = res.data.Data.NAS.Overview;
          this.threatsDetected_data = res.data.Data.NAS.Threats;
          this.vpnLogins_data = res.data.Data.NAS.VPN;
          this.vpnSessionType_data = res.data.Data.NAS.VPN;
          this.vpnSessions_data = res.data.Data.NAS.VPN;
          this.vpnUsers_data = res.data.Data.NAS.VPN;
          this.WarnedProceeded_data = res.data.Data.NAS.WarnedTraffic;
          this.warnedTraffic_data = res.data.Data.NAS.WarnedTraffic;
          this.warnedProceededEvent_data = res.data.Data.NAS.WarnedTraffic;
          this.warnRules_data = res.data.Data.NAS.WarnedTraffic;
          this.WarnCategories_data = res.data.Data.NAS.WarnedTraffic;
          this.warnedUserAgent_data = res.data.Data.NAS.WarnedTraffic;
          this.warnedUsers_data = res.data.Data.NAS.WarnedTraffic;
          this.AAReport_overview = res.data.Data.NAS.Overview;
          this.categoriesTime_data = res.data.Data.IU.Productivity;

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
          let dat = res.data.Data.IU;
          let nas = res.data.Data.NAS;
          this.IsUserSelected = rep.UserType;
          this.acceptableApp_data = dat.Acceptable;
          this.acceptable_sites = dat.Acceptable;
          this.acceptable_users = dat.Acceptable;
          this.acceptableTable_data = dat['Application-table'];
          this.unproductiveTable_data = dat['Application-table'];
          this.productiveApp_data = dat.Productivity;
          this.productiveSites_data = dat.Productive;
          this.productiveUsers_data = dat.Productive;
          this.acceptableSiteTable_data = dat['Sites-table'];
          this.acceptableUsersTable_data = dat['Users-table'];
          this.productiveAppTable_data = dat['Application-table'];
          this.productiveSitesTable_data = dat['Sites-table'];
          this.productiveUsersTable_data = dat['Users-table'];
          this.unacceptableApp_data = dat.Unacceptable;
          this.unacceptableAppTable_data = dat['Application-table'];
          this.unacceptableSites_data = dat.Unacceptable;
          this.unacceptableSitesTable_data = dat['Sites-table'];
          this.unacceptableUsers_data = dat.Unacceptable;
          this.unacceptableUsersTable_data = dat['Users-table'];
          this.unproductiveApp_data = dat.Unproductive;
          this.unproductiveAppTable_data = dat['Application-table'];
          this.unproductiveSites_data = dat.Unproductive;
          this.unproductiveUsers_data = dat.Unproductive;
          this.unproductiveSitesTable_data = dat['Sites-table'];
          this.unproductiveUsersTable_data = dat['Users-table'];
          this.applicationSize_data = dat.Bandwidth.ApplicationsBySize;
          this.bandwidthOvertime_data = dat.Bandwidth.BandwidthOverTime;
          this.blockedApp_data = dat.blocked;
          this.blockedCategories_data = dat.Blocked;
          this.blockUser_data = dat.Blocked;
          this.blockedSites_data = dat.blocked;
          this.categoriesBrowsingTime_data = dat.Bandwidth.CategoriesBySize;
          this.departmentSize_data = dat.Bandwidth.DepartmentsBySize;
          this.blockedEvent_data = dat.Blocked;
          this.productivityBrowsing_data = dat.Productivity.ProductivityByBrowsingTime;
          this.productivityOverTime_data = dat.Productivity.ProductivityOverTime;
          this.sitesBySize_data = dat.Bandwidth.SitesBySize;
          this.usersBrowsingTime_data = dat.top_users_by_browsing_time;
          this.userBySize_data = dat.Bandwidth.UsersBySize;
          this.warnedCategories_data = dat.Warned;
          this.warnedUser_data = dat.Warned;
          this.warnedProceeded_data = dat.Warned;
          this.warnedEvents_data = dat.Warned;
          this.downloadedFiles_data = dat.Bandwidth.DownloadedFiles;
          this.firewallRulesTable_data = dat.Bandwidth.FirewallRules;
          this.unacceptableApplication_data = nas.AllowedTraffic;
          this.allowedUnacceptableSites_data = nas.AllowedTraffic;
          this.allowedUnacceptableUsers_data = nas.AllowedTraffic;
          this.unproductiveApplications_data = nas.AllowedTraffic;
          this.allowedUnproductiveSites_data = nas.AllowedTraffic;
          this.allowedUnproductiveUsers_data = nas.AllowedTraffic;
          this.acceptableSites_data = nas.BlockedTraffic;
          this.blockedApplications_data = nas.BlockedTraffic;
          this.NASBlockedCategory_data = nas.BlockedTraffic;
          this.blockedPolicies_data = nas.BlockedTraffic;
          this.NASproductiveSites_data = nas.BlockedTraffic;
          this.NASunacceptableSites_data = nas.BlockedTraffic;
          this.NASunproductiveSites_data = nas.BlockedTraffic;
          this.NASUserAgent_data = nas.BlockedTraffic;
          this.blockedUser_data = nas.BlockedTraffic;
          this.blockedTraffic_data = nas.BlockedTraffic;
          this.blockedEvents_data = nas.BlockedTraffic;
          this.networkConnection_data = nas.Network;
          this.networkCountries_data = nas.Network;
          this.networkDestinationIp_data = nas.Network;
          this.networkInterfaces_data = nas.Network;
          this.sourceHostMacs_data = nas.Network;
          this.sourceIp_data = nas.Network;
          this.networkUsers_data = nas.Network;
          this.networkZones_data = nas.Network;
          this.firewallException_data = nas.Firewall;
          this.filterActions_data = nas.Firewall;
          this.firewalls_data = nas.Firewall;
          this.firewallRules_data = nas.Firewall;
          this.excludedSites_data = nas.Firewall;
          this.userAgent_data = nas.Firewall;
          this.uncategorizedSites_data = nas.Firewall;
          this.firewallActions_data = nas.Overview;
          this.firewallOvertime_data = nas.Overview;
          this.threatsDetected_data = nas.Threats;
          this.vpnLogins_data = nas.VPN;
          this.vpnSessionType_data = nas.VPN;
          this.vpnSessions_data = nas.VPN;
          this.vpnUsers_data = nas.VPN;
          this.WarnedProceeded_data = nas.WarnedTraffic;
          this.warnedTraffic_data = nas.WarnedTraffic;
          this.warnedProceededEvent_data = nas.WarnedTraffic;
          this.warnRules_data = nas.WarnedTraffic;
          this.WarnCategories_data = nas.WarnedTraffic;
          this.warnedUserAgent_data = nas.WarnedTraffic;
          this.warnedUsers_data = nas.WarnedTraffic;
          this.AAReport_overview = nas.Overview;
          this.categoriesTime_data = dat.Productivity;

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

    if (widget === 'bandwidth-overtime') {
      this.BandwidthOverTimeChartData = baseData;
    }

    if (widget === 'productivity-over-time') {
      this.ProductivityOverTimeChartData = baseData;
    }
    
    if (widget === 'firewall-action-overtime') {
      this.FirewallActionOvertimeChartData = baseData;
    }
    if (widget === 'vpn-sessions') {
      this.VPNSessionsChartData = baseData;
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
    // if (widget === 'all-firewall-overtime') {
    //   this.AllFirewallActionOverTimeData = baseData;
    // }
    // if (widget === 'all-Vpn-sessions') {
    //   this.AllVPNSessionsChartData = baseData;
    // }
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

    // if (widget === 'all-threats-detected') {
    //   this.AllThreatsDetectedChartData = baseData;
    // }

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

    if (widget === 'acceptable-app') {
      this.AcceptableAppChartData = baseData;
    }
    if (widget === 'acceptable-sites') {
      this.AcceptableSitesChartData = baseData;
    }
    if (widget === 'acceptable-users') {
      this.AcceptableUsersChartData = baseData;
    }
    if (widget === 'acceptable-table') {
      this.AcceptableChartData = baseData;
    }
    if (widget === 'productive-app') {
      this.ProductiveUsersBrowsingTimeChartData = baseData;
    }
    if (widget === 'productive-sites') {
      this.ProductiveSitesChartData = baseData;
    }
    if (widget === 'productive-users') {
      this.ProductiveUsersChartData = baseData;
    }
    if (widget === 'productive-applications') {
      this.ProductiveApplicationsChartData = baseData;
    }
    if (widget === 'unacceptable-app') {
      this.UnacceptableAppChartData = baseData;
    }
    if (widget === 'unacceptable-sites') {
      this.UnacceptableSitesChartData = baseData;
    }
    if (widget === 'unacceptable-users') {
      this.UnacceptableUsersChartData = baseData;
    }
    if (widget === 'unproductive-app') {
      this.UnproductiveAppChartData = baseData;
    }
    if (widget === 'unproductive-sites') {
      this.UnproductiveSitesChartData = baseData;
    }
    if (widget === 'unproductive-users') {
      this.UnproductiveUsersChartData = baseData;
    }
    if (widget === 'sites-by-size') {
      this.SitesBySizeChartData = baseData;
    }
    if (widget === 'users-browsing-time') {
      this.TopUsersBrowsingTimeChartData = baseData;
    }
    if (widget === 'users-size') {
      this.TopUsersBySizeChartData = baseData;
    }
    if (widget === 'network-connections') {
      this.NetworkConnectionsChartData = baseData;
    }
    if (widget === 'network-countries') {
      this.NetworkCountriesChartData = baseData;
    }
    if (widget === 'network-destination-ip') {
      this.NetworkDestinationIpChartData = baseData;
    }
    if (widget === 'network-interfaces') {
      this.NetworkInterfacesChartData = baseData;
    }
    if (widget === 'network-source-macs') {
      this.SourceHostandMacsChartData = baseData;
    }
    if (widget === 'network-source-ips') {
      this.SourceIpsChartData = baseData;
    }
    if (widget === 'network-users') {
      this.NetworkUsersChartData = baseData;
    }
    if (widget === 'network-zones') {
      this.NetworkZonesChartData = baseData;
    }
    if (widget === 'threats-detected') {
      this.ThreatsDetectedChartData = baseData;
    }
    if (widget === 'vpn-session-types') {
      this.VPNSessionTypeChartData = baseData;
    }
    if (widget === 'vpn-users') {
      this.VPNUsersChartData = baseData;
    }
    if (widget === 'warned-events') {
      this.warnedEventsChartData = baseData;
    }

    // if (widget === 'all-destination-ip') {
    //   this.AllDestinationIpChartData = baseData;
    // }
    // if (widget === 'all-interface-network') {
    //   this.AllInterfaceNetworkChartData = baseData;
    // }
    // if (widget === 'all-sourceHost-Macs-network') {
    //   this.AllSourceHostsAndMAcsChartData = baseData;
    // }
    // if (widget === 'all-source-ip') {
    //   this.AllSourceIpChartData = baseData;
    // }
    // if (widget === 'all-user-network') {
    //   this.AllUsersChartData = baseData;
    // }
    // if (widget === 'all-zone-network') {
    //   this.AllZoneNetworkChartData = baseData;
    // }
    // if (widget === 'all-unacceptable-application') {
    //   this.AllUnacceptableAppChartData = baseData;
    // }
    // if (widget === 'all-unacceptable-sites') {
    //   this.AllAllowedUnacceptableSitesChartData = baseData;
    // }
    // if (widget === 'all-unacceptable-users') {
    //   this.AllAllowedUnacceptableUsersChartData = baseData;
    // }
    // if (widget === 'all-unproductive-applications') {
    //   this.AllAllowedUnproductiveApplicationsChartData = baseData;
    // }
    // if (widget === 'all-unproductive-users') {
    //   this.AllAllowedUnproductiveUsersChartData = baseData;
    // }
    // if (widget === 'all-unproductive-sites') {
    //   this.AllAllowedUnproductiveSitesChartData = baseData;
    // }
    // if (widget === 'all-Vpn-session-type') {
    //   this.AllVPNSessionTypeChartData = baseData;
    // }
    // if (widget === 'all-Vpn-users') {
    //   this.AllVPNUsersChartData = baseData;
    // }



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
          // innerSize: 10,
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

    if (widget === 'applications-size') {
      this.ApplicationBySizeChartData = baseData;
    }
    if (widget === 'blocked-categories') {
      this.BlockedCategoriesChartData = baseData;
    }
    if (widget === 'blocked-sites') {
      this.BlockedSitesChartData = baseData;
    }
    if (widget === 'categories-browsing-time') {
      this.CategoriesBrowsingTimeChartData = baseData;
    }
    if (widget === 'department-size') {
      this.DepartmentBySizeChartData = baseData;
    }
    if (widget === 'blocked-events') {
      this.BlockedEventChartData = baseData;
    }
    if (widget === 'productivity-browsing-time') {
      this.ProductivityByBrowsingTimeChartData = baseData;
    }
    if (widget === 'warned-categories') {
      this.warnedCategoriesChartData = baseData;
    }
    if (widget === 'warned-users') {
      this.warnedUsersChartData = baseData;
    }
    if (widget === 'unacceptable-application') {
      this.UnacceptableApplicationsChartData = baseData;
    }
    if (widget === 'unacceptable-sites') {
      this.AllowedUnacceptableSitesChartData = baseData;
    }
    if (widget === 'unacceptable-users') {
      this.AllowedUnacceptableUsersChartData = baseData;
    }
    if (widget === 'unproductive-applications') {
      this.AllowedUnproductiveApplicationsChartData = baseData;
    }
    if (widget === 'unproductive-sites') {
      this.AllowedUnproductiveSitesChartData = baseData;
    }
    if (widget === 'unproductive-users') {
      this.AllowedUnproductiveUsersChartData = baseData;
    }
    if (widget === 'blocked-acceptable-sites') {
      this.BlockedAcceptableSitesChartData = baseData;
    }
    if (widget === 'blocked-applications') {
      this.BlockedApplicationsChartData = baseData;
    }
    if (widget === 'blocked-category') {
      this.NASBlockedCategoriesChartData = baseData;
    }
    if (widget === 'blocked-policies') {
      this.BlockedPoliciesChartData = baseData;
    }
    if (widget === 'blocked-productive-sites') {
      this.BlockedProductiveSitesChartData = baseData;
    }
    if (widget === 'blocked-unacceptable-sites') {
      this.BlockedUnacceptableSitesChartData = baseData;
    }
    if (widget === 'blocked-unproductive-sites') {
      this.BlockedUnproductiveSitesChartData = baseData;
    }
    if (widget === 'blocked-user-agent') {
      this.BlockedUserAgentChartData = baseData;
    }
    if (widget === 'blocked-users') {
      this.BlockedUsersChartData = baseData;
    }
    if (widget === 'blocked-traffic') {
      this.BlockedTrafficChartData = baseData;
    }
    if (widget === 'blocked-events') {
      this.BlockedEventsChartData = baseData;
    }
    if (widget === 'firewall-exception') {
      this.FirewallExceptionChartData = baseData;
    }
    if (widget === 'firewall-actions') {
      this.FilterActionsChartData = baseData;
    }

    if (widget === 'firewalls') {
      this.FirewallsChartData = baseData;
    }
    if (widget === 'firewall-rules') {
      this.FirewallRulesChartData = baseData;
    }
    if (widget === 'excluded-sites') {
      this.TopExcludedSitesChartData = baseData;
    }
    if (widget === 'user-agent') {
      this.TopUserAgentChartData = baseData;
    }
    if (widget === 'uncategorized-sites') {
      this.UncategorizedSitesChartData = baseData;
    }
    if (widget === 'firewallFilter-actions') {
      this.FirewallActionsChartData = baseData;
    }
    if (widget === 'vpn-logins') {
      this.VPNLoginsChartData = baseData;
    }
    if (widget === 'warned-proceeded') {
      this.CategoriesWarnedProceededChartData = baseData;
    }
    if (widget === 'warned-traffic') {
      this.warnedTrafficChartData = baseData;
    }
    if (widget === 'warned-proceeded-event') {
      this.warnedProceededEventChartData = baseData;
    }
    if (widget === 'warned-rules') {
      this.warnedRulesChartData = baseData;
    }
    if (widget === 'warn-categories') {
      this.WarnCategoriesChartData = baseData;
    }
    if (widget === 'warn-user-agent') {
      this.WarnedUserAgentChartData = baseData;
    }
    if (widget === 'warn-users') {
      this.WarnedUsersChartData = baseData;
    }
    if (widget === 'blocked-application') {
      this.BlockedApplicationChartData = baseData;
    }
    if (widget === 'categories-browsing-time') {
      this.CategoriesByBrowsingTimeChartData = baseData;
    }
    if (widget === 'warned-proceeded') {
      this.warnedProceededChartData = baseData;
    }
    if (widget === 'block-users') {
      this.IUBlockedUsersChartData = baseData;
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

    // if (widget === 'all-firewall-actions') {
    //   this.AllFirewallPieChartData = baseData;
    // }
    // if (widget === 'all-exception-firewall') {
    //   this.AllExceptionFirewallChartData = baseData;
    // }
    // if (widget === 'all-firewalls') {
    //   this.AllFirewallsChartData = baseData;
    // }
    // if (widget === 'all-filterAction-firewall') {
    //   this.AllFilterActionsChartData = baseData;
    // }
    // if (widget === 'all-rules-firewall') {
    //   this.AllRulesFirewallChartData = baseData;
    // }
    // if (widget === 'all-excluded-sites') {
    //   this.AllTopExcludedSitesChartData = baseData;
    // }
    // if (widget === 'all-agent-user') {
    //   this.AllAgentUserChartData = baseData;
    // }
    // if (widget === 'all-sites-uncategory') {
    //   this.AllUncategorizedChartData = baseData;
    // }
    // // if (widget === 'all-uncategorized-sites') {
    // //   this.AllUncategorizedSitesChartData = baseData;
    // // }
    // if (widget === 'all-acceptable-sites') {
    //   this.AllAcceptableSitesChartData = baseData;
    // }
    // if (widget === 'all-blocked-applications') {
    //   this.AllBlockedApplicationsChartData = baseData;
    // }
    // if (widget === 'all-blocked-categories') {
    //   this.AllBlockedCategoriesChartData = baseData;
    // }
    // if (widget === 'all-blocked-policies') {
    //   this.AllBlockedPoliciesChartData = baseData;
    // }
    // if (widget === 'all-blocked-productive') {
    //   this.AllProductiveSitesChartData = baseData;
    // }
    // if (widget === 'all-blocked-unacceptable') {
    //   this.AllUnacceptableSitesChartData = baseData;
    // }
    // if (widget === 'all-blocked-unproductive') {
    //   this.AllUnproductiveSitesChartData = baseData;
    // }
    // if (widget === 'all-blocked-user-agent') {
    //   this.AllBlockedUserAgentChartData = baseData;
    // }
    // if (widget === 'all-blocked-user') {
    //   this.AllBlockedUsersChartData = baseData;
    // }
    // if (widget === 'all-blocked-traffic') {
    //   this.AllBlockedTrafficChartData = baseData;
    // }
    // if (widget === 'all-blocked-event') {
    //   this.AllBlockedEventChartData = baseData;
    // }
    // if (widget === 'all-warned-procceded') {
    //   this.AllWarnedAndProccededChartData = baseData;
    // }
    // if (widget === 'all-warned-traffic') {
    //   this.AllWarnedTrafficChartData = baseData;
    // }
    // if (widget === 'all-warned-procceded-event') {
    //   this.AllWarnedAndProccededEventChartData = baseData;
    // }
    // if (widget === 'all-warned-rules') {
    //   this.AllWarnRulesChartData = baseData;
    // }
    // if (widget === 'all-warned-categories') {
    //   this.AllWarnedCategoriesChartData = baseData;
    // }
    // if (widget === 'all-warned-user-agent') {
    //   this.AllWarnedUserAgentChartData = baseData;
    // }
    // if (widget === 'all-warned-users') {
    //   this.AllWarnedUsersChartData = baseData;
    // }
    // if (widget === 'all-Vpn') {
    //   this.AllVPNFailedPieChartData = baseData;
    // }





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

      //All Activity Chart Data
      this.setStackedBarChartBaseDataStructure('acceptable-app');
      this.AcceptableAppChartData['xAxis']['categories'] =
        this.acceptableApp_data.TopAcceptableApplications.Chart.Labels;
      this.AcceptableAppChartData['series'] =
        this.acceptableApp_data.TopAcceptableApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('acceptable-sites');
      this.AcceptableSitesChartData['xAxis']['categories'] =
        this.acceptable_sites.TopAcceptableSites.Chart.Labels;
      this.AcceptableSitesChartData['series'] =
        this.acceptable_sites.TopAcceptableSites.Chart.Series;

      this.setStackedBarChartBaseDataStructure('acceptable-users');
      this.AcceptableUsersChartData['xAxis']['categories'] =
        this.acceptable_users.TopAcceptableUsers.Chart.Labels;
      this.AcceptableUsersChartData['series'] =
        this.acceptable_users.TopAcceptableUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('productive-app');
      this.ProductiveUsersBrowsingTimeChartData['xAxis']['categories'] =
        this.productiveApp_data.TopUsersByBrowsingTime.Chart.Labels;
      this.ProductiveUsersBrowsingTimeChartData['series'] =
        this.productiveApp_data.TopUsersByBrowsingTime.Chart.Series;

      this.setStackedBarChartBaseDataStructure('productive-sites');
      this.ProductiveSitesChartData['xAxis']['categories'] =
        this.productiveSites_data.TopProductiveSites.Chart.Labels;
      this.ProductiveSitesChartData['series'] =
        this.productiveSites_data.TopProductiveSites.Chart.Series;

      this.setStackedBarChartBaseDataStructure('productive-users');
      this.ProductiveUsersChartData['xAxis']['categories'] =
        this.productiveUsers_data.TopProductiveUsers.Chart.Labels;
      this.ProductiveUsersChartData['series'] =
        this.productiveUsers_data.TopProductiveUsers.Chart.Series;

        this.setStackedBarChartBaseDataStructure('productive-applications');
        this.ProductiveApplicationsChartData['xAxis']['categories'] =
          this.productiveUsers_data.TopProductiveApplications.Chart.Labels;
        this.ProductiveApplicationsChartData['series'] =
          this.productiveUsers_data.TopProductiveApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('unacceptable-app');
      this.UnacceptableAppChartData['xAxis']['categories'] =
        this.unacceptableApp_data.TopUnacceptableApplications.Chart.Labels;
      this.UnacceptableAppChartData['series'] =
        this.unacceptableApp_data.TopUnacceptableApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('unacceptable-sites');
      this.UnacceptableSitesChartData['xAxis']['categories'] =
        this.unacceptableSites_data.TopUnacceptableSites.Chart.Labels;
      this.UnacceptableSitesChartData['series'] =
        this.unacceptableSites_data.TopUnacceptableSites.Chart.Series;

      this.setStackedBarChartBaseDataStructure('unacceptable-users');
      this.UnacceptableUsersChartData['xAxis']['categories'] =
        this.unacceptableUsers_data.TopUnacceptableUsers.Chart.Labels;
      this.UnacceptableUsersChartData['series'] =
        this.unacceptableUsers_data.TopUnacceptableUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('unproductive-app');
      this.UnproductiveAppChartData['xAxis']['categories'] =
        this.unproductiveApp_data.TopUnproductiveApplications.Chart.Labels;
      this.UnproductiveAppChartData['series'] =
        this.unproductiveApp_data.TopUnproductiveApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('unproductive-sites');
      this.UnproductiveSitesChartData['xAxis']['categories'] =
        this.unproductiveSites_data.TopUnproductiveSites.Chart.Labels;
      this.UnproductiveSitesChartData['series'] =
        this.unproductiveSites_data.TopUnproductiveSites.Chart.Series;

      this.setStackedBarChartBaseDataStructure('unproductive-users');
      this.UnproductiveUsersChartData['xAxis']['categories'] =
        this.unproductiveUsers_data.TopUnproductiveUsers.Chart.Labels;
      this.UnproductiveUsersChartData['series'] =
        this.unproductiveUsers_data.TopUnproductiveUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('sites-by-size');
      this.SitesBySizeChartData['xAxis']['categories'] =
        this.sitesBySize_data.Chart.Labels;
      this.SitesBySizeChartData['series'] =
        this.sitesBySize_data.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('users-browsing-time');
      // this.TopUsersBrowsingTimeChartData['xAxis']['categories'] =
      //   this.usersBrowsingTime_data.chart.Labels;
      // this.TopUsersBrowsingTimeChartData['series'] =
      //   this.usersBrowsingTime_data.chart.Series;

      this.setStackedBarChartBaseDataStructure('users-size');
      this.TopUsersBySizeChartData['xAxis']['categories'] =
        this.userBySize_data.Chart.Labels;
      this.TopUsersBySizeChartData['series'] =
        this.userBySize_data.Chart.Series;

      this.setStackedBarChartBaseDataStructure('network-connections');
      this.NetworkConnectionsChartData['xAxis']['categories'] =
        this.networkConnection_data.Connections.Chart.Labels;
      this.NetworkConnectionsChartData['series'] =
        this.networkConnection_data.Connections.Chart.Series;

      this.setStackedBarChartBaseDataStructure('network-countries');
      this.NetworkCountriesChartData['xAxis']['categories'] =
        this.networkCountries_data.Countries.Chart.Labels;
      this.NetworkCountriesChartData['series'] =
        this.networkCountries_data.Countries.Chart.Series;

      this.setStackedBarChartBaseDataStructure('network-destination-ip');
      this.NetworkDestinationIpChartData['xAxis']['categories'] =
        this.networkDestinationIp_data.DestinationIPs.Chart.Labels;
      this.NetworkDestinationIpChartData['series'] =
        this.networkDestinationIp_data.DestinationIPs.Chart.Series;

      this.setStackedBarChartBaseDataStructure('network-interfaces');
      this.NetworkInterfacesChartData['xAxis']['categories'] =
        this.networkInterfaces_data.Interfaces.Chart.Labels;
      this.NetworkInterfacesChartData['series'] =
        this.networkInterfaces_data.Interfaces.Chart.Series;


      this.setStackedBarChartBaseDataStructure('network-source-macs');
      this.SourceHostandMacsChartData['xAxis']['categories'] =
        this.sourceHostMacs_data.SourceHostsAndMACs.Chart.Labels;
      this.SourceHostandMacsChartData['series'] =
        this.sourceHostMacs_data.SourceHostsAndMACs.Chart.Series;

      this.setStackedBarChartBaseDataStructure('network-source-ips');
      this.SourceIpsChartData['xAxis']['categories'] =
        this.sourceIp_data.SourceIPs.Chart.Labels;
      this.SourceIpsChartData['series'] =
        this.sourceIp_data.SourceIPs.Chart.Series;

      this.setStackedBarChartBaseDataStructure('network-users');
      this.NetworkUsersChartData['xAxis']['categories'] =
        this.networkUsers_data.Users.Chart.Labels;
      this.NetworkUsersChartData['series'] =
        this.networkUsers_data.Users.Chart.Series;

      this.setStackedBarChartBaseDataStructure('network-zones');
      this.NetworkZonesChartData['xAxis']['categories'] =
        this.networkZones_data.Zones.Chart.Labels;
      this.NetworkZonesChartData['series'] =
        this.networkZones_data.Zones.Chart.Series;

      this.setStackedBarChartBaseDataStructure('threats-detected');
      this.ThreatsDetectedChartData['xAxis']['categories'] =
        this.threatsDetected_data.ThreatsDetected.Chart.Labels;
      this.ThreatsDetectedChartData['series'] =
        this.threatsDetected_data.ThreatsDetected.Chart.Series;

      this.setStackedBarChartBaseDataStructure('vpn-session-types');
      this.VPNSessionTypeChartData['xAxis']['categories'] =
        this.vpnSessionType_data.VPNSessionTypes.Chart.Labels;
      this.VPNSessionTypeChartData['series'] =
        this.vpnSessionType_data.VPNSessionTypes.Chart.Series;

      this.setStackedBarChartBaseDataStructure('vpn-users');
      this.VPNUsersChartData['xAxis']['categories'] =
        this.vpnUsers_data.VPNUsers.Chart.Labels;
      this.VPNUsersChartData['series'] =
        this.vpnUsers_data.VPNUsers.Chart.Series;

        this.setStackedBarChartBaseDataStructure('warned-events');
        this.warnedEventsChartData['xAxis']['categories'] =
          this.warnedEvents_data.WarnedEvents.Chart.Labels;
        this.warnedEventsChartData['series'] =
          this.warnedEvents_data.WarnedEvents.Chart.Series;

      //Pie Chart Data
      this.setProductivityByBrowsingTimePieChartDataStructure('applications-size');
      this.ApplicationBySizeChartData['series'] =
        this.applicationSize_data.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-categories');
      this.BlockedCategoriesChartData['series'] =
        this.blockedCategories_data.Categories.Chart.Series;

      // this.setProductivityByBrowsingTimePieChartDataStructure('blocked-sites');
      // this.BlockedSitesChartData['series'] =
      //   this.blockedSites_data.sites.chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('categories-browsing-time');
      this.CategoriesBrowsingTimeChartData['series'] =
        this.categoriesBrowsingTime_data.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('department-size');
      this.DepartmentBySizeChartData['series'] =
        this.departmentSize_data.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-events');
      this.BlockedEventChartData['series'] =
        this.blockedEvent_data.BlockedEvents.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('productivity-browsing-time');
      this.ProductivityByBrowsingTimeChartData['series'] =
        this.productivityBrowsing_data.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warned-categories');
      this.warnedCategoriesChartData['series'] =
        this.warnedCategories_data.Categories.Chart.Series;

        this.setProductivityByBrowsingTimePieChartDataStructure('warned-users');
      this.warnedUsersChartData['series'] =
        this.warnedUser_data.Users.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('unacceptable-application');
      this.UnacceptableApplicationsChartData['series'] =
        this.unacceptableApplication_data.AllowedUnacceptableApplications.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('unacceptable-sites');
      this.AllowedUnacceptableSitesChartData['series'] =
        this.allowedUnacceptableSites_data.AllowedUnacceptableSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('unacceptable-users');
      this.AllowedUnacceptableUsersChartData['series'] =
        this.allowedUnacceptableUsers_data.AllowedUnacceptableUsers.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('unproductive-applications');
      this.AllowedUnproductiveApplicationsChartData['series'] =
        this.unproductiveApplications_data.AllowedUnproductiveApplications.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('unproductive-sites');
      this.AllowedUnproductiveSitesChartData['series'] =
        this.allowedUnproductiveSites_data.AllowedUnproductiveSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('unproductive-users');
      this.AllowedUnproductiveUsersChartData['series'] =
        this.allowedUnproductiveUsers_data.AllowedUnproductiveUsers.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-acceptable-sites');
      this.BlockedAcceptableSitesChartData['series'] =
        this.acceptableSites_data.BlockedAcceptableSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-applications');
      this.BlockedApplicationsChartData['series'] =
        this.blockedApplications_data.BlockedApplications.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-category');
      this.NASBlockedCategoriesChartData['series'] =
        this.NASBlockedCategory_data.BlockedCategories.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-policies');
      this.BlockedPoliciesChartData['series'] =
        this.blockedPolicies_data.BlockedPolicies.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-productive-sites');
      this.BlockedProductiveSitesChartData['series'] =
        this.NASproductiveSites_data.BlockedProductiveSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-unacceptable-sites');
      this.BlockedUnacceptableSitesChartData['series'] =
        this.NASunacceptableSites_data.BlockedUnacceptableSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-unproductive-sites');
      this.BlockedUnproductiveSitesChartData['series'] =
        this.NASunproductiveSites_data.BlockedUnproductiveSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-user-agent');
      this.BlockedUserAgentChartData['series'] =
        this.NASUserAgent_data.BlockedUserAgents.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-users');
      this.BlockedUsersChartData['series'] =
        this.blockedUser_data.BlockedUsers.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-traffic');
      this.BlockedTrafficChartData['series'] =
        this.blockedTraffic_data.MostBlockedTraffic.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('blocked-events');
      this.BlockedEventsChartData['series'] =
        this.blockedEvents_data.OtherBlockedEvents.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('firewall-exception');
      this.FirewallExceptionChartData['series'] =
        this.firewallException_data.Exceptions.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('firewall-actions');
      this.FilterActionsChartData['series'] =
        this.filterActions_data.FilterActions.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('firewalls');
      this.FirewallsChartData['series'] =
        this.firewalls_data.Firewalls.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('firewall-rules');
      this.FirewallRulesChartData['series'] =
        this.firewallRules_data.Rules.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('excluded-sites');
      this.TopExcludedSitesChartData['series'] =
        this.excludedSites_data.TopExcludedSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('user-agent');
      this.TopUserAgentChartData['series'] =
        this.userAgent_data.TopUserAgents.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('uncategorized-sites');
      this.UncategorizedSitesChartData['series'] =
        this.uncategorizedSites_data.UncategorizedSites.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('firewallFilter-actions');
      this.FirewallActionsChartData['series'] =
        this.firewallActions_data.FirewallActions.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('vpn-logins');
      this.VPNLoginsChartData['series'] =
        this.vpnLogins_data.FailedVPNLogins.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warned-proceeded');
      this.CategoriesWarnedProceededChartData['series'] =
        this.WarnedProceeded_data.CategoriesWarnedAndProceeded.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warned-traffic');
      this.warnedTrafficChartData['series'] =
        this.warnedTraffic_data.MostWarnedTraffic.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warned-proceeded-event');
      this.warnedProceededEventChartData['series'] =
        this.warnedProceededEvent_data.OtherWarnedAndProceededEvents.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warned-rules');
      this.warnedRulesChartData['series'] =
        this.warnRules_data.WarnRules.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warn-categories');
      this.WarnCategoriesChartData['series'] =
        this.WarnCategories_data.WarnedCategories.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warn-user-agent');
      this.WarnedUserAgentChartData['series'] =
        this.warnedUserAgent_data.WarnedUserAgents.Chart.Series;

      this.setProductivityByBrowsingTimePieChartDataStructure('warn-users');
      this.WarnedUsersChartData['series'] =
        this.warnedUsers_data.WarnedUsers.Chart.Series;

        this.setProductivityByBrowsingTimePieChartDataStructure('categories-browsing-time');
      this.CategoriesByBrowsingTimeChartData['series'] =
        this.categoriesTime_data.CategoriesByBrowsingTime.Chart.Series;

        this.setProductivityByBrowsingTimePieChartDataStructure('warned-proceeded');
        this.warnedProceededChartData['series'] =
          this.warnedProceeded_data.WarnedAndProceeded.Chart.Series;

          this.setProductivityByBrowsingTimePieChartDataStructure('block-users');
      this.IUBlockedUsersChartData['series'] =
        this.blockUser_data.Users.Chart.Series;
      // this.setProductivityByBrowsingTimePieChartDataStructure('blocked-application');
      // this.BlockedApplicationChartData['series'] =
      //   this.blockedApp_data.applications.chart.Series;

      //Line Chart Data

      this.setProductivityOverTimeChartDataStructure('bandwidth-overtime');
      this.BandwidthOverTimeChartData['series'] =
        this.bandwidthOvertime_data.Chart.Series;

      this.setProductivityOverTimeChartDataStructure('productivity-over-time');
      this.ProductivityOverTimeChartData['series'] =
        this.productivityOverTime_data.Chart.Series;

    

      this.setProductivityOverTimeChartDataStructure('firewall-action-overtime');
      this.FirewallActionOvertimeChartData['series'] =
        this.firewallOvertime_data.FirewallActionsOverTime.Chart.Series;


      this.setProductivityOverTimeChartDataStructure('vpn-sessions');
      this.VPNSessionsChartData['series'] =
        this.vpnSessions_data.VPNSessions.Chart.Series;




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
