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
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.css'],
})
export class ReportlistComponent implements OnInit {
  @ViewChild('dialogRef')
  dialogRef!: TemplateRef<any>;

  // @ViewChild('content')
  // content!: ElementRef<any>;
  testModal: any;

  public reportCount: any;
  public filteredReportCount: any;
  // public date = Highcharts.dateFormat('%A, %b %e, %Y', '12/31/17');
  public pageIndex = 0;
  public pageSize: number = 10;
  public pageSizeOptions = [10, 15, 20, 30, 50];
  public pageSlice: any = [];

  public theReportId: string = '';
  public loading: boolean = false;

  public reportList: any = [];
  public search_term: string = '';
  public OPTIONS: any = null;

  reportActiveStatus: boolean = false;
  selectedReport = 'Hello';

  myFooList = [
    'Some Item',
    'Item Second',
    'Other In Row',
    'What to write',
    'Blah To Do',
  ];


  constructor(

    private _http: HttpService,
    private _auth: AuthService,
    private router: Router,
    // public dialog: MatDialog
    private authService: AuthService,
    // public infoDialog: MatDialog
  ) {

  }


  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Reporting List`);
    this.loading = false;
    // this._auth.reportingIsActive();
    this.getReportList(true, 0);
  }

  getDownloadPDf(reportId: any) {
    this._http.get(`eql/download_report?report_id=${reportId}`).subscribe(
      (res) => {
        this.onDismiss();
        if (res.status) {
          window.open(res.data, '_blank');
        }
      },
      async (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          this.onDismiss();
        } else {
          await new Promise((f) => setTimeout(f, 2000));
          this.onDismiss();
        }
      }
    );
  }

  onDismiss() {
    const target = "#PDFGenerateReport";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
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

  // OnPageChange(e: PageEvent) {
  //   console.log(e);
  //   this.pageSize = e.pageSize;
  //   this.pageIndex = e.pageIndex;
  //   const startIndex = e.pageIndex * e.pageSize;
  //   let endIndex = startIndex + e.pageSize;
  //   if (endIndex > this.reportCount) {
  //     endIndex = this.reportCount;
  //   }
  //   this.getReportList(false);
  //   // this.pageSlice = this.ruleList.slice(startIndex, endIndex);
  // }
  // openDialog() {
  //   // this.selectedReport = name;
  //   const myTempDialog = this.dialog.open(this.dialogRef, {
  //     data: this.myFooList,
  //   });
  //   myTempDialog.afterClosed().subscribe((result) => {
  //     console.log(result);
  //     if (result == 'true') {
  //       // this.deleteThisRule(id);
  //       console.log('deleting');
  //     }
  //   });
  // }

  openDialog() {

  }

  ngDoCheck(): void {
    // console.log('Check:  '+this.ruleActiveStatus);
  }

  // viewThisRule(ruleID: string) {
  //   // this.router.navigate(['main/dashboard/rule-detail',ruleID])
  //   this.router.navigate(['main/dashboard/rule-view', ruleID]);
  // }

  // viewThisReport(reportID: string) {
  //   // this.router.navigate(['main/dashboard/reporting'])
  //   this.router.navigate(['/reporting'], {
  //     state: {
  //       id: reportID,
  //       frontEnd: JSON.stringify({ framwork: 'Angular', version: '14' }),
  //       site: 'edupala.com',
  //     },
  //   });
  // }
  viewThisReport(report: any) {
    if (report.ReportType === 'NAS') {
      if (report.UserType === 'Single') {
        this.router.navigate(['/reporting/NASSingle-Report/' + report.ID])
      }
      else if (report.UserType === 'All') {
        this.router.navigate(['/reporting/NAS-Report/' + report.ID])
      } else {
        this.router.navigate(['/reporting'])
      }
    } 
    else if (report.ReportType === 'AA') {
      if (report.UserType === 'All') {
        this.router.navigate(['/reporting/AllActivity-Report/' + report.ID])
      } else {
        this.router.navigate(['/reporting'])
      }
    } 
    else {
      this.router.navigate(['/reporting'])
    }
  }


  PageJump: any = 10;
  PageTotalNumber: any = [];
  getReportList(reset: boolean = true, page: number) {
    // this.ruleList = [];
    this.loading = true;
    let url =
      'eql/reportsinfo/?search=&page=' +
      this.currentPage +
      '&pagesize=' +
      this.pageSize;
    if (reset == false) {
      url =
        'eql/reportsinfo/?search=' +
        this.search_term +
        '&page=' +
        this.currentPage +
        '&pagesize=' +
        this.pageSize;
    } else {
      this.search_term = '';
    }
    let newReportList: any = [];
    this._http.get(url).subscribe(
      (res) => {
        if (res.status) {
          console.log('Fetched All Reports List');
          // this.ruleList = res.data;
          for (let i = 0; i < res.data.reports.length; i++) {
            if (!res.data.reports[i].Report) {
              continue;
            }
            if (res.data.reports[i].Report.length == 2) {
              continue;
            }
            let element = res.data.reports[i];
            if (element.Report.UserType === 'singleuser') {
              element.Report.UserType = 'Single';
            } else if (element.Report.UserType === 'allusers') {
              element.Report.UserType = 'All';
              element.Report.UserBasisValue = 'All Users';
            }
            newReportList.push(element);
          }
          this.reportList = newReportList;
          console.log(this.reportList.length, 'total proper reports');
          // let i = 0;
          // for (i = 0; i < this.reportList.length; i++) {
          //   const element = this.reportList[i];
          // }
          const responseData = res;
          this.PageTotalNumber = [];
          let Count = responseData.data.total / 10;
          for (let i = 0; i < Count; i += this.PageJump) {
            this.PageTotalNumber.push(i);
          }
          this.pageSlice = this.reportList;
          this.totalItems = responseData.data.total;
          this.loading = false;
          this.reportCount = res.data.total;
          // this.filteredReportCount = res.data.filtered;
        }
        this.loading = false;
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          this.loading = false;
          // alert(error.error.error);
        } else {
          this.loading = false;
        }
      }
    );
  }

  currentPage: number = 1;
  totalItems: number | undefined;
  onPageChange(event: any, data: any) {
    if (data === '1') {
      this.currentPage = event;
      this.getReportList(true, this.currentPage);
    } else {
      this.currentPage = Number(event.target.value);
      this.getReportList(true, this.currentPage)
    }
  }
  statusChange(event: any, id: string, val: boolean) {
    console.log(event);
    if (val == true) {
      // this.deactivateThisRule(id);
      console.log('deativatin');
    } else if (val == false) {
      // this.activateThisRule(id);
      console.log('ativatin');
    }
    // if (this.ruleActiveStatus==true) {
    //   this.activateThisRule(id);
    // }
    // else if(this.ruleActiveStatus==false){
    //   this.deactivateThisRule(id);
    // }
  }
  selectThisRule(id: string) {
    this.theReportId = id;
  }
  activateReporting() {
    // this._auth.reportingIsActive();
    this.router.navigate(['main/dashboard/rule-detail', 'new']);
  }

}
