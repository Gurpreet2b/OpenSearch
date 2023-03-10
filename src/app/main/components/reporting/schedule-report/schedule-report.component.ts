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
  selector: 'app-schedule-report',
  templateUrl: './schedule-report.component.html',
  styleUrls: ['./schedule-report.component.css'],
})
export class ScheduleReportComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  public chartOptions: any;
  public chartOptionsLine: any;
  public OPTIONS: any = null;
  @ViewChild('content')
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
  public scheduleTime: any = '01:00';
  
  public reportDataReady = false;
  public IsDisabledReport = false;

  public additionalFiltersEnabled: boolean = true;
  public AddEmailListArray: any = [];
  public internetActivityArray: any = [];
  public securityNetworkArray: any = [];

  public IsUserSelected: any = 'singleuser';
  public isActivityRadio: any = 'allActivity';
  public isSchduleTypeRadio: any = 'daily';
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
  public scheduleType: any = "daily";
  public AddEmailForm: FormGroup;
  public submitted = false;
  public SMTPSettingsForm: FormGroup;


  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Schedule Report`);
    console.log(this.showControls);
    // if (this.fetchReportID != '') {
    //   this.showControls = false;
    //   console.log('Fetching report with id', this.fetchReportID);
    //   this.fetchThisReport(this.fetchReportID);
    // } else {
    //   console.log('No ID Specified');
    // }
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
    // this.AddEmailListArray.push({});

    this.AddEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    });

    this.GetSMTPSettings();

    this.SMTPSettingsForm = this.fb.group({
      smtp_server: ['', [Validators.required]],
      smtp_port: ['', [Validators.required]],
      smtp_use_ssl: [false],
      smtp_use_tls: [false],
      smtp_use_authentication: [false],
      smtp_username: ['', [Validators.required]],
      smtp_password: ['', [Validators.required]],
      smtp_from_address: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      test_email_address: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    });
  }  

  // convenience getter for easy access to form fields
  get f() { return this.SMTPSettingsForm.controls; }

  onSubmitSMTP(type: any) {
   this.submitted = true;
   this.SMTPSettingsForm.markAllAsTouched();
   if (!this.SMTPSettingsForm.valid) {
     return;
   }
   const dataToSubmit = { ...this.SMTPSettingsForm.value };
   const formData = new FormData();
  
   Object.keys(dataToSubmit).forEach(key => {
     if (!formData.has(key)) {
       formData.append(key, dataToSubmit[key])
     }
   });

   this.loading = true;
   if (type === 'save') {
    this._http.post('eql/smtp_details/', formData).subscribe((res: any) => {
      if (res.status === true) {
        const responseData = res.data;
        alert("SMTP Settings Detail Data Successfully !!")
        this.DismissSMTPEmail();
        this.loading = false;
      } else {
        alert(res.message);
        this.loading = false;
      }
    }, error => {
      if (error.error.code === 'token_not_valid') {
        this.authService.logout();
        this.router.navigate(['/signin']);
        this.loading = false;
        // alert(error.error.error);
      } else {
        this.loading = false;
        alert(error.error.error);
      }
    });
   } else {
    this._http.post('eql/test_email/', formData).subscribe((res: any) => {
      if (res.status === true) {
        const responseData = res.data;
        alert("SMTP Test Email Successfully !!")
        this.DismissSMTPEmail();
        this.loading = false;
      } else {
        alert(res.message);
        this.loading = false;
      }
    }, error => {
      if (error.error.code === 'token_not_valid') {
        this.authService.logout();
        this.router.navigate(['/signin']);
        this.loading = false;
        // alert(error.error.error);
      } else {
        this.loading = false;
        alert(error.error.error);
      }
    });
   }
   

 }

 DismissSMTPEmail(){
   const target = "#scheduleMail";
   $(target).hide();
   $('.modal-backdrop').remove();
   $("body").removeClass("modal-open");
   $("body").addClass("modal-overflow");
 }


 GetSMTPSettings() {
   this.loading = true;
   this._http.get('eql/smtp_details/', null).subscribe((res: any) => {
     if (res.status === true) {
       const responseData = res.data;
       this.SMTPSettingsForm.setValue({
         smtp_server: res.data.smtp_server,
         smtp_port: res.data.smtp_port,
         smtp_use_ssl: res.data.smtp_use_ssl,
         smtp_use_tls: res.data.smtp_use_tls,
         smtp_use_authentication: res.data.smtp_use_authentication,
         smtp_username: res.data.smtp_username,
         smtp_password: res.data.smtp_password,
         smtp_from_address: res.data.smtp_from_address,
         test_email_address: res.data.test_email_address
       });

       this.loading = false;
     } else {
       alert(res.message);
       this.loading = false;
     }
   }, error => {
     if (error.error.code === 'token_not_valid') {
       this.authService.logout();
       this.router.navigate(['/signin']);
       this.loading = false;
       // alert(error.error.error);
     } else {
       this.loading = false;
       alert(error.error.error);
     }
   });
 }


  // convenience getter for easy access to form fields
  get ff() { return this.AddEmailForm.controls; }

  addEmailSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.AddEmailForm.invalid) {
        return;
    }
    this.AddEmailListArray.push(this.AddEmailForm.value.email);
    // this.AddEmailForm.reset();
    this.DismissEmail();
  }

  DismissEmail(){
    const target = "#scheduleAddMailModal";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
  }

  removeAdditionalFilter(i: number) {
    this.AddEmailListArray.splice(i, 1);
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

    if (this.AddEmailListArray.length === 0) {
      alert('Please Enter Email');
      return;
    }

    this.loading = true;
    let request: any = {
      // start: new Date(this.fullStartDate).toISOString(),
      // end: new Date(this.fullEndDate).toISOString(),
      user_type: this.userType,
      report_type: this.reportType,
      schedule_type: this.scheduleType,
      recievers_list: JSON.stringify(this.AddEmailListArray),
      schedule_time: this.scheduleTime
    };
    if (this.useFirewallID) {
      request.user_id = this.reportUser;
    } else {
      if (this.userType == 'singleuser') {
        request.report_user = this.reportUser;
      } else {
        request.report_user = '';
      }
    }
    // this.openInfoDialog();
    this._http.post('eql/schedule_report/', request).subscribe(
      async (res) => {
        if (res.status) {
          // this.ShowReportPopup();
          this.router.navigate(['/reporting/schedule-report-list']);
          this.loading = false;
          // alert('Success');
          this.IsUserSelected = this.userType;
          this.reportDataReady = true;
          this.IsDisabledReport = true;
          await new Promise((f) => setTimeout(f, 3000));
          this.onDismiss();
          this.scroll(this.content.nativeElement);
          // this.scroll(this.document.getElementById('content'))
        } else {
          this.loading = false;
          alert(res.message);
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
  
  ShowReportPopup(){
    const target = "#generateReport";
    $(target).show();
    $('modal-backdrop').add();
    $("body").addClass("modal-open");
  }

  DismissReport(){
    const target = "#generateReport";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
  }


  loadLatestReport(reportID: any) {
    this.router.navigate(['/reporting'], {
      state: {
        id: reportID,
        frontEnd: JSON.stringify({ framwork: 'Angular', version: '14' }),
        // site: 'edupala.com',
      },
    });
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
  ScheduleTypeRadio(event: any) {
    this.isSchduleTypeRadio = event;
  }

  OpenPopup() {
    this.loading = true;
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

  
}
