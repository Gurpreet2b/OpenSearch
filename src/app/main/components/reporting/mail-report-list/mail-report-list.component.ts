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
  selector: 'app-mail-report-list',
  templateUrl: './mail-report-list.component.html',
  styleUrls: ['./mail-report-list.component.css'],
})
export class MailReportlistComponent implements OnInit {
 
  public reportCount: any;
  public filteredReportCount: any;
  public pageIndex = 1;
  public pageSize: number = 10;
  public pageSizeOptions = [10, 15, 20, 30, 50];
  public pageSlice: any = [];
  public loading: boolean = false;
  public reportList: any = [];

  constructor(
    private _http: HttpService,
    private _auth: AuthService,
    private router: Router,
    private authService: AuthService,
  ) {

  }

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Schedule Reporting List`);
    this.loading = false;
    this.getScheduleReportList(1);
  }


  PageJump: any = 10;
  PageTotalNumber: any = [];
  getScheduleReportList(page: number) {
   
    this._http.get(`eql/schedule_report/?page=${page}`).subscribe((res) => {
        if (res.status) {
          this.reportList = res.data;
          const responseData = res;
          this.PageTotalNumber = [];
          let Count = responseData.count / 10;
          for (let i = 0; i < Count; i += this.PageJump) {
            this.PageTotalNumber.push(i);
          }
          this.pageSlice = this.reportList;
          this.totalItems = responseData.count;
          this.loading = false;
          this.reportCount = res.count;
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
      this.getScheduleReportList(this.currentPage);
    } else {
      this.currentPage = Number(event.target.value);
      this.getScheduleReportList(this.currentPage)
    }
  }

  delete(id: number) {
    if (confirm('Are you sure delete this record?')) {
      this.onDeleteSchedule(id);
    }
  }
  onDeleteSchedule(id: number) {
    this.loading = true;
    this._http.delete(`eql/schedule_report/${id}/`).subscribe((res: any) => {
      if (res.status === true) {
        alert("Schedule Report Deleted Successfully");
        this.getScheduleReportList(this.currentPage);
      } else {
        alert(res.error);
        this.loading = false;
      }
    }, error => {
      if (error.error.code === 'token_not_valid') {
        this.authService.logout();
        this.router.navigate(['/signin']);
        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }

}
