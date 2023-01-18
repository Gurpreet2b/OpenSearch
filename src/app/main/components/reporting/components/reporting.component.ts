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
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css'],
})
export class ReportingComponent implements OnInit {
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
  public reportType = 'Internet Usage';
  public userType = 'singleuser';
  public reportSource = 'Sophos Firewall';
  public reportUser = '';
  public reportData_Overview: any;
  public reportData_Bandwidth: any;
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
  public isActivityRadio: any = 'allActivity';
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


  subject: Subject<any> = new Subject();


  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Reporting`);
    console.log(this.showControls);
    if (this.fetchReportID != '') {
      this.showControls = false;
      console.log('Fetching report with id', this.fetchReportID);
      this.fetchThisReport(this.fetchReportID);
    } else {
      console.log('No ID Specified');
    }
    this.getLatestReportInfo();
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

  // test(){
  //   const target = "#pdfDownload";
  //   $(target).show();

  // }

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
          this.loading = false;
          // alert('Success');
          this.IsUserSelected = this.userType;
          this.reportData_Overview = res.data.Data.Widgets.Overview;
          this.reportData_Bandwidth = res.data.Data.Widgets.Bandwidth;
          this.reportData_Blocked = res.data.Data.Widgets.Blocked;
          this.reportData_Warned = res.data.Data.Widgets.Warned;
          this.reportData_Productivity = res.data.Data.Widgets.Productivity;
          this.reportData_Unacceptable = res.data.Data.Widgets.Unacceptable;
          this.reportData_Unproductive = res.data.Data.Widgets.Unproductive;
          this.reportData_Productive = res.data.Data.Widgets.Productive;
          this.reportData_Acceptable = res.data.Data.Widgets.Acceptable;

          this.ApplicationsTableData =
            res.data.Data.Widgets.Productivity.ApplicationsTableData;
          this.SitesTableData =
            res.data.Data.Widgets.Productivity.SitesTableData;
          this.AllTopProductivityTables =
            res.data.Data.Widgets['Productivity-Tables'];

          this.chartintialize(request.type);
          this.reportDataReady = true;
          this.IsDisabledReport = true;
          await new Promise((f) => setTimeout(f, 3000));
          this.onDismiss();
          this.scroll(this.content.nativeElement);
          // this.scroll(this.document.getElementById('content'))
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
  fetchThisReport(report_id: any) {
    this._http.get('eql/reportsinfo/' + report_id).subscribe(
      async (res) => {
        if (res.status) {
          this.loading = false;
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
          let dat = res.data.Data.Widgets;
          this.IsUserSelected = rep.UserType;
          this.reportData_Overview = dat.Overview;
          this.reportData_Bandwidth = dat.Bandwidth;
          this.reportData_Blocked = dat.Blocked;
          this.reportData_Warned = dat.Warned;
          this.reportData_Productivity = dat.Productivity;
          this.reportData_Unacceptable = dat.Unacceptable;
          this.reportData_Unproductive = dat.Unproductive;
          this.reportData_Productive = dat.Productive;
          this.reportData_Acceptable = dat.Acceptable;

          this.ApplicationsTableData = dat.Productivity.ApplicationsTableData;
          this.SitesTableData = dat.Productivity.SitesTableData;
          this.AllTopProductivityTables = dat['Productivity-Tables'];

          this.chartintialize(rep.UserType);
          this.reportDataReady = true;
          this.IsDisabledReport = true;
          await new Promise((f) => setTimeout(f, 3000));
          this.onDismiss();
          this.scroll(this.content.nativeElement);
          this.onDismiss();
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
          text: 'Date',
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
        text: '',
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
    if (widget === 'bandwidth-overtime') {
      this.BandwidthOverTimeChartOptions = baseData;
    }
    if (widget === 'productivity-overtime') {
      this.ProductivityOverTimeChartOptions = baseData;
    }

    // All Users Line Charts
    if (widget === 'all-bandwidth-overtime') {
      this.AllBandwidthOverTimeChartOptions = baseData;
    }
    if (widget === 'all-productivity-overtime') {
      this.AllProductivityOverTimeChartOptions = baseData;
    }
  }

  setBarChartBaseDataStructure(widget: string) {
    let baseData = {
      chart: {
        type: 'bar',
        events: {
          redraw: (chart: any) => {
            console.log('bar callback event');
            console.log(chart);
            let categoryHeight = 20;
            chart.update({
              chart: {
                height:
                  categoryHeight * chart.pointCount +
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
    if (widget === 'productivity-unproductive-applications') {
      this.UnProductiveApplicationsChartOptions = baseData;
    }
    if (widget === 'productivity-acceptable-applications') {
      this.AcceptableApplicationsChartOptions = baseData;
    }
    if (widget === 'productivity-productive-applications') {
      this.ProductiveApplicationsChartOptions = baseData;
    }

    if (widget === 'productivity-unacceptable-sites') {
      this.UnAcceptableSitesChartOptions = baseData;
    }
    if (widget === 'productivity-unproductive-sites') {
      this.UnProductiveSitesChartOptions = baseData;
    }
    if (widget === 'productivity-acceptable-sites') {
      this.AcceptableSitesChartOptions = baseData;
    }
    if (widget === 'productivity-productive-sites') {
      this.ProductiveSitesChartOptions = baseData;
    }
    //Allusers charts widget name
    if (widget === 'AllUsers-Browsing-Time') {
      this.AllUsersBrowsingTime = baseData;
    }
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
          text: 'Bandwidth',
          align: 'high',
        },
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
        series: {
          stacking: 'normal',
          groupPadding: 0,
          pointPadding: 0,
        },
      },
      series: [],
    };
    // pointWidth: 20,
    // bar: {
    //   dataLabels: {
    //     enabled: false,
    //   },
    // },

    // All Users by bar chart Start
    if (widget === 'all-user-by-size') {
      this.AllUsersBySizeChartOptions = baseData;
    }
    if (widget === 'all-sites-by-size') {
      this.AllSitesBySizeChartOptions = baseData;
    }
    //unacceptable
    if (widget === 'Allproductivity-unacceptable-users') {
      this.AllTopUnacceptableUsers = baseData;
    }
    if (widget === 'Allproductivity-unacceptable-applications') {
      this.AllUnAcceptableApplicationsChartOptions = baseData;
    }
    if (widget === 'Allproductivity-unacceptable-sites') {
      this.AllTopUnacceptableSitesChartOptions = baseData;
    }
    // if (widget === 'AllUnacceptable-Sites-CleanOn') {
    //   this.AllTopUnproductiveSitesCleanOn = baseData;
    // }
    // if (widget === 'AllUnacceptable-Sites-CleanOff') {
    //   this.AllTopUnproductiveSitesCleanOff = baseData;
    // }
    //unproductive
    if (widget === 'AllUnproductive-Users') {
      this.AllTopUnproductiveUsers = baseData;
    }
    if (widget === 'AllUnproductive-Applications') {
      this.AllTopUnproductiveApplications = baseData;
    }
    if (widget === 'AllUnproductive-Sites') {
      this.AllTopUnproductiveSites = baseData;
    }
    // if (widget === 'AllUnproductive-Sites-CleanOn') {
    //   this.AllTopUnproductiveSitesCleanOn = baseData;
    // }
    //acceptable
    if (widget === 'AllAcceptable-Users') {
      this.AllTopAcceptableUsers = baseData;
    }
    if (widget === 'AllAcceptable-Applications') {
      this.AllTopAcceptableApplications = baseData;
    }
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

  setPieChartBaseDataStructure(widget: string, bytes: string = 'MB') {
    let baseData = {
      chart: {
        //  plotBorderWidth: null,
        plotShadow: false,
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
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
    if (widget === 'bandwidth-applications') {
      this.ApplicationsBySizeChartOptions = baseData;
    }
    if (widget === 'Productive-Browsing-Time') {
      this.ProductivityByBrowsingTimeChartOptions = baseData;
    }
    if (widget === 'bandwidth-categories') {
      this.CategoriesBySizeChartOptions = baseData;
    }
    if (widget === 'blocked-categories') {
      this.BlockedCategoriesChartOptions = baseData;
    }
    if (widget === 'blocked-sites') {
      this.BlockedSitesChartOptions = baseData;
    }
    if (widget === 'blocked-applications') {
      this.BlockedApplicationChartOptions = baseData;
    }
    if (widget === 'warned-proceeded') {
      this.WarnedAndProceededChartOptions = baseData;
    }
    if (widget === 'warned-categories') {
      this.WarnedCategoriesChartOptions = baseData;
    }

    // All Users by Pie chart Start
    if (widget === 'all-department-by-size') {
      this.AllDepartmentsBySizeChartOptions = baseData;
    }
    if (widget === 'all-application-by-size') {
      this.AllApplicationsBySizeChartOptions = baseData;
    }
    if (widget === 'all-categories-by-size') {
      this.AllCategoriesBySizeChartOptions = baseData;
    }
    if (widget === 'all-categories-by-browsing-time') {
      this.AllCategoriesByBrowsingTimeChartOptions = baseData;
    }
    if (widget === 'AllProductive-Browsing-Time') {
      this.AllProductivityByBrowsingTimeChartOptions = baseData;
    }
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
      //set bandwidth applicatios by size pie chart
      this.setPieChartBaseDataStructure('bandwidth-applications');
      this.ApplicationsBySizeChartOptions['series'][0]['data'] =
        this.reportData_Bandwidth.ApplicationsBySize.Chart.Series[0].data;

      //set Productive By Browsing Time pie chart
      this.setPieChartBaseDataStructure('Productive-Browsing-Time');
      this.ProductivityByBrowsingTimeChartOptions['series'][0]['data'] =
        this.reportData_Productivity.ProductivityByBrowsingTime.Chart.Series[0].data;

      // set bandwidth categories by size pie chartOptionsLine
      this.setPieChartBaseDataStructure('bandwidth-categories');
      this.CategoriesBySizeChartOptions['series'][0]['data'] =
        this.reportData_Bandwidth.CategoriesBySize.Chart.Series[0].data;

      // set blocked categories by size pie chart
      this.setPieChartBaseDataStructure('blocked-categories');
      this.BlockedCategoriesChartOptions['series'][0]['data'] =
        this.reportData_Blocked.Categories.Chart.Series[0].data;

      // set blocked sites by size pie chart
      this.setPieChartBaseDataStructure('blocked-sites');
      this.BlockedSitesChartOptions['series'][0]['data'] =
        this.reportData_Blocked.Sites.Chart.Series[0].data;

      // set blocked Applications by size pie chart
      this.setPieChartBaseDataStructure('blocked-applications');
      this.BlockedApplicationChartOptions['series'][0]['data'] =
        this.reportData_Blocked.Applications.Chart.Series[0].data;

      // set Warned and Proceeded by size pie chart
      this.setPieChartBaseDataStructure('warned-proceeded');
      this.WarnedAndProceededChartOptions['series'][0]['data'] =
        this.reportData_Warned.WarnedAndProceeded.Chart.Series[0].data;

      // set Warned Categories by size pie chart
      this.setPieChartBaseDataStructure('warned-categories');
      this.WarnedCategoriesChartOptions['series'][0]['data'] =
        this.reportData_Warned.Categories.Chart.Series[0].data;

      //set bandwidth sites by size bar chart
      if (this.SitesBySizeChartOptions.length > 0) {
        this.SitesBySizeChartOptions = {};
      }
      this.setBarChartBaseDataStructure('bandwidth-sites');
      this.SitesBySizeChartOptions['xAxis']['categories'] =
        this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      this.SitesBySizeChartOptions['series'] =
        this.reportData_Bandwidth.SitesBySize.Chart.Series;

      this.setLineChartBaseDataStructure('bandwidth-overtime', 'MB');
      this.BandwidthOverTimeChartOptions['series'] =
        this.reportData_Bandwidth.BandwidthOverTime.Chart.Series;
      // this.BandwidthOveTimeChartOptions['xAxis']['categories'] =
      // this.reportData_Bandwidth.BandwidthOverTime.Chart.Labels;

      this.setLineChartBaseDataStructure('productivity-overtime');
      this.ProductivityOverTimeChartOptions['series'] =
        this.reportData_Productivity.ProductivityOverTime.Chart.Series;

      this.setBarChartBaseDataStructure(
        'productivity-unacceptable-applications'
      );
      this.UnAcceptableApplicationsChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.UnacceptableApplicationsByBrowsingTime.Chart.Labels;
      this.UnAcceptableApplicationsChartOptions['series'] =
        this.reportData_Productivity.UnacceptableApplicationsByBrowsingTime.Chart.Series;

      this.setBarChartBaseDataStructure(
        'productivity-unproductive-applications'
      );
      this.UnProductiveApplicationsChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.UnproductiveApplicationsByBrowsingTime.Chart.Labels;
      this.UnProductiveApplicationsChartOptions['series'] =
        this.reportData_Productivity.UnproductiveApplicationsByBrowsingTime.Chart.Series;

      this.setBarChartBaseDataStructure('productivity-acceptable-applications');
      this.AcceptableApplicationsChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.AcceptableApplicationsByBrowsingTime.Chart.Labels;
      this.AcceptableApplicationsChartOptions['series'] =
        this.reportData_Productivity.AcceptableApplicationsByBrowsingTime.Chart.Series;

      this.setBarChartBaseDataStructure('productivity-productive-applications');
      this.ProductiveApplicationsChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.ProductiveApplicationsByBrowsingTime.Chart.Labels;
      this.ProductiveApplicationsChartOptions['series'] =
        this.reportData_Productivity.ProductiveApplicationsByBrowsingTime.Chart.Series;

      this.setBarChartBaseDataStructure('productivity-unacceptable-sites');
      this.UnAcceptableSitesChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.UnacceptableSitesByBrowsingTime.Chart.Labels;
      this.UnAcceptableSitesChartOptions['series'] =
        this.reportData_Productivity.UnacceptableSitesByBrowsingTime.Chart.Series;

      this.setBarChartBaseDataStructure('productivity-unproductive-sites');
      this.UnProductiveSitesChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.UnproductiveSitesByBrowsingTime.Chart.Labels;
      this.UnProductiveSitesChartOptions['series'] =
        this.reportData_Productivity.UnproductiveSitesByBrowsingTime.Chart.Series;

      this.setBarChartBaseDataStructure('productivity-acceptable-sites');
      this.AcceptableSitesChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.AcceptableSitesByBrowsingTime.Chart.Labels;
      this.AcceptableSitesChartOptions['series'] =
        this.reportData_Productivity.AcceptableSitesByBrowsingTime.Chart.Series;

      this.setBarChartBaseDataStructure('productivity-productive-sites');
      this.ProductiveSitesChartOptions['xAxis']['categories'] =
        this.reportData_Productivity.ProductiveSitesByBrowsingTime.Chart.Labels;
      this.ProductiveSitesChartOptions['series'] =
        this.reportData_Productivity.ProductiveSitesByBrowsingTime.Chart.Series;
    } else if (userType === 'allusers') {
      // // //All Users Graph chart Start

      //set Bandwidth Section Charts
      this.setLineChartBaseDataStructure('all-bandwidth-overtime', 'MB');
      this.AllBandwidthOverTimeChartOptions['series'] =
        this.reportData_Bandwidth.BandwidthOverTime.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-user-by-size');
      this.AllUsersBySizeChartOptions['xAxis']['categories'] =
        this.reportData_Bandwidth.UsersBySize.Chart.Labels;
      this.AllUsersBySizeChartOptions['series'] =
        this.reportData_Bandwidth.UsersBySize.Chart.Series;

      this.setStackedBarChartBaseDataStructure('all-sites-by-size');
      this.AllSitesBySizeChartOptions['xAxis']['categories'] =
        this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      this.AllSitesBySizeChartOptions['series'] =
        this.reportData_Bandwidth.SitesBySize.Chart.Series;
      console.log(this.AllSitesBySizeChartOptions);
      // //set applications by size pie chart
      this.setPieChartBaseDataStructure('all-application-by-size');
      this.AllApplicationsBySizeChartOptions['series'][0]['data'] =
        this.reportData_Bandwidth.ApplicationsBySize.Chart.Series[0].data;

      // //set categories by size pie chart
      this.setPieChartBaseDataStructure('all-categories-by-size');
      this.AllCategoriesBySizeChartOptions['series'][0]['data'] =
        this.reportData_Bandwidth.CategoriesBySize.Chart.Series[0].data;

      // //set departments by size pie chart
      // this.setPieChartBaseDataStructure('all-department-by-size');
      // this.AllDepartmentsBySizeChartOptions['series'][0]['data'] = this.reportData_Bandwidth.CategoriesBySize.Chart.Series[0].data;

      // // //set Productivity Section Charts
      this.setLineChartBaseDataStructure('all-productivity-overtime');
      this.AllProductivityOverTimeChartOptions['series'] =
        this.reportData_Productivity.ProductivityOverTime.Chart.Series;

      this.setPieChartBaseDataStructure('AllProductive-Browsing-Time');
      this.AllProductivityByBrowsingTimeChartOptions['series'][0]['data'] =
        this.reportData_Productivity.ProductivityByBrowsingTime.Chart.Series[0].data;

      this.setPieChartBaseDataStructure('all-categories-by-browsing-time');
      this.AllCategoriesByBrowsingTimeChartOptions['series'][0]['data'] =
        this.reportData_Productivity.CategoriesByBrowsingTime.Chart.Series[0].data;

      this.setBarChartBaseDataStructure('AllUsers-Browsing-Time');
      this.AllUsersBrowsingTime['xAxis']['categories'] =
        this.reportData_Productivity.TopUsersByBrowsingTime.Chart.Labels;
      this.AllUsersBrowsingTime['series'] =
        this.reportData_Productivity.TopUsersByBrowsingTime.Chart.Series;

      // set Unacceptable Section charts data

      this.setStackedBarChartBaseDataStructure(
        'Allproductivity-unacceptable-users'
      );
      this.AllTopUnacceptableUsers['xAxis']['categories'] =
        this.reportData_Unacceptable.TopUnacceptableUsers.Chart.Labels;
      this.AllTopUnacceptableUsers['series'] =
        this.reportData_Unacceptable.TopUnacceptableUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure(
        'Allproductivity-unacceptable-applications'
      );
      this.AllUnAcceptableApplicationsChartOptions['xAxis']['categories'] =
        this.reportData_Unacceptable.TopUnacceptableApplications.Chart.Labels;
      this.AllUnAcceptableApplicationsChartOptions['series'] =
        this.reportData_Unacceptable.TopUnacceptableApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure(
        'Allproductivity-unacceptable-sites'
      );
      this.AllTopUnacceptableSitesChartOptions['xAxis']['categories'] =
        this.reportData_Unacceptable.TopUnacceptableSites.Chart.Labels;
      this.AllTopUnacceptableSitesChartOptions['series'] =
        this.reportData_Unacceptable.TopUnacceptableSites.Chart.Series;

      //unproductive
      this.setStackedBarChartBaseDataStructure('AllUnproductive-Users');
      this.AllTopUnproductiveUsers['xAxis']['categories'] =
        this.reportData_Unproductive.TopUnproductiveUsers.Chart.Labels;
      this.AllTopUnproductiveUsers['series'] =
        this.reportData_Unproductive.TopUnproductiveUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('AllUnproductive-Applications');
      this.AllTopUnproductiveApplications['xAxis']['categories'] =
        this.reportData_Unproductive.TopUnproductiveApplications.Chart.Labels;
      this.AllTopUnproductiveApplications['series'] =
        this.reportData_Unproductive.TopUnproductiveApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('AllUnproductive-Sites');
      this.AllTopUnproductiveSites['xAxis']['categories'] =
        this.reportData_Unproductive.TopUnproductiveSites.Chart.Labels;
      this.AllTopUnproductiveSites['series'] =
        this.reportData_Unproductive.TopUnproductiveSites.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllUnproductive-Sites-CleanOn');
      // this.AllTopUnproductiveSitesCleanOn['xAxis']['categories'] = this.reportData_Unproductive.TopUnproductiveUsers.Chart.Labels;
      // this.AllTopUnproductiveSitesCleanOn['series'] = this.reportData_Unproductive.TopUnproductiveUsers.Chart.Series;

      //Acceptable

      this.setStackedBarChartBaseDataStructure('AllAcceptable-Users');
      this.AllTopAcceptableUsers['xAxis']['categories'] =
        this.reportData_Acceptable.TopAcceptableUsers.Chart.Labels;
      this.AllTopAcceptableUsers['series'] =
        this.reportData_Acceptable.TopAcceptableUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('AllAcceptable-Applications');
      this.AllTopAcceptableApplications['xAxis']['categories'] =
        this.reportData_Acceptable.TopAcceptableApplications.Chart.Labels;
      this.AllTopAcceptableApplications['series'] =
        this.reportData_Acceptable.TopAcceptableApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('AllAcceptable-Sites');
      this.AllTopAcceptableSites['xAxis']['categories'] =
        this.reportData_Acceptable.TopAcceptableSites.Chart.Labels;
      this.AllTopAcceptableSites['series'] =
        this.reportData_Acceptable.TopAcceptableSites.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllAcceptable-Sites-CleanOn');
      // this.AllTopAcceptableSiteCleanOn['xAxis']['categories'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      // this.AllTopAcceptableSiteCleanOn['series'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Series;

      //productive
      this.setStackedBarChartBaseDataStructure('AllProductive-Users');
      this.AllTopProductiveUsers['xAxis']['categories'] =
        this.reportData_Productive.TopProductiveUsers.Chart.Labels;
      this.AllTopProductiveUsers['series'] =
        this.reportData_Productive.TopProductiveUsers.Chart.Series;

      this.setStackedBarChartBaseDataStructure('AllProductive-Applications');
      this.AllTopProductiveApplications['xAxis']['categories'] =
        this.reportData_Productive.TopProductiveApplications.Chart.Labels;
      this.AllTopProductiveApplications['series'] =
        this.reportData_Productive.TopProductiveApplications.Chart.Series;

      this.setStackedBarChartBaseDataStructure('AllProductive-Sites');
      this.AllTopProductiveSites['xAxis']['categories'] =
        this.reportData_Productive.TopProductiveSites.Chart.Labels;
      this.AllTopProductiveSites['series'] =
        this.reportData_Productive.TopProductiveSites.Chart.Series;

      // this.setStackedBarChartBaseDataStructure('AllProductive-Sites-CleanOn');
      // this.AllTopProductiveSitesOn['xAxis']['categories'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Labels;
      // this.AllTopProductiveSitesOn['series'] =
      //   this.reportData_Bandwidth.SitesBySize.Chart.Series;

      //Blocked

      this.setBarChartBaseDataStructure('AllBlocked-Events');
      this.AllBlockedEvents['xAxis']['categories'] =
        this.reportData_Blocked.BlockedEvents.Chart.Labels;
      this.AllBlockedEvents['series'] =
        this.reportData_Blocked.BlockedEvents.Chart.Series;

      this.setStackedBarChartBaseDataStructure('AllBlocked-Users');
      this.AllTopBlockedUsers['xAxis']['categories'] =
        this.reportData_Blocked.Users.Chart.Labels;
      this.AllTopBlockedUsers['series'] =
        this.reportData_Blocked.Users.Chart.Series;

      this.setPieChartBaseDataStructure('AllBlocked-Categories');
      this.AllBlockedCategories['series'][0]['data'] =
        this.reportData_Blocked.Categories.Chart.Series[0].data;

      //Warned and Proceeded

      this.setBarChartBaseDataStructure('AllWarned-Events');
      this.AllWarnedEvent['xAxis']['categories'] =
        this.reportData_Warned.WarnedEvents.Chart.Labels;
      this.AllWarnedEvent['series'] =
        this.reportData_Warned.WarnedEvents.Chart.Series;

      this.setPieChartBaseDataStructure('AllWarned-Procceded');
      this.AllWarnedAndProcceded['series'][0]['data'] =
        this.reportData_Warned.WarnedAndProceeded.Chart.Series[0].data;

      this.setBarChartBaseDataStructure('AllWarned-Users');
      this.AllWarnedUsers['xAxis']['categories'] =
        this.reportData_Warned.Users.Chart.Labels;
      this.AllWarnedUsers['series'] = this.reportData_Warned.Users.Chart.Series;

      this.setPieChartBaseDataStructure('AllWarned-Categories');
      this.AllWarnedCategoriesPieChartOption['series'][0]['data'] =
        this.reportData_Warned.Categories.Chart.Series[0].data;

      // this.setPieChartBaseDataStructure('Allblocked-sites');
      // this.AllBlockedSitesChartOptions['series'][0]['data'] = this.reportData_Blocked.Categories.Chart.Series[0].data;
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
}
