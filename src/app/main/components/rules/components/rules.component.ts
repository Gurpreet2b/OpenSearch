
import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService, AuthService } from 'src/app/core/services';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// import Highcharts from 'highcharts';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  @Output() emitActiveTabName: EventEmitter<string> = new EventEmitter();

  @ViewChild('dialogRef')
  dialogRef!: TemplateRef<any>;

  @ViewChild('content')
  content!: ElementRef<any>;

  public ruleCount: any;
  public filteredRuleCount: any;
  // public date = Highcharts.dateFormat('%A, %b %e, %Y', '12/31/17');
  public pageIndex = 0;
  public pageSize: number = 10;
  public pageSizeOptions = [10, 15, 20, 30, 50];
  public pageSlice: any = [];

  public theRuleId: string = '';
  public loading: boolean = false;

  public ruleList: any = [];
  public search_term: string = '';
  public OPTIONS: any = null;

  ruleActiveStatus: boolean = false;
  selectedRule = 'Hello';
  myFooList = [
    'Some Item',
    'Item Second',
    'Other In Row',
    'What to write',
    'Blah To Do',
  ];
  dialog: any;
  // currentPage: any;

  constructor(private _http: HttpService,
    private _auth: AuthService,
    private router: Router,
    private authService: AuthService) {
      
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

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Rules`);
    this.loading = false;
    // this._auth.rulesIsActive();
    this.getRuleList(true);
    console.log('logginfads');
  }

  public SavePDF(): void {
    html2canvas(this.content.nativeElement, { scale: 3 }).then((canvas) => {
      const imageGeneratedFromTemplate = canvas.toDataURL('image/png');
      const imageGeneratedFromTemplate2 = canvas.toDataURL('image/png');
      const fileWidth = 100;
      const generatedImageHeight = (canvas.height * fileWidth) / canvas.width;
      let PDF = new jsPDF('p', 'mm', 'a4');
      PDF.addImage(
        imageGeneratedFromTemplate,
        'PNG',
        0,
        5,
        fileWidth,
        generatedImageHeight
      );
      PDF.addPage();
      PDF.addImage(
        imageGeneratedFromTemplate,
        'PNG',
        0,
        5,
        fileWidth,
        generatedImageHeight
      );
      // PDF.html(this.content.nativeElement.innerHTML)
      PDF.save('pdf-demo.pdf');
    });
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
  
  openDialog(name: string, id: string) {
    this.selectedRule = name;
    const myTempDialog = this.dialog.open(this.dialogRef, {
      data: this.myFooList,
    });
    myTempDialog.afterClosed().subscribe((result) => {
      console.log(result);
      if (result == 'true') {
        this.deleteThisRule(id);
      }
    });
  }

  ngDoCheck(): void {
    // console.log('Check:  '+this.ruleActiveStatus);
  }

  viewThisRule(ruleID: string) {
    this.router.navigate(['/rules/rule-view', ruleID]);
  }


  PageJump: any = 10;
  PageTotalNumber: any = [];
  getRuleList(reset: boolean = true) {
    // this.ruleList = [];
    this.loading = true;
    let url =
      'eql/rule/?search=&page=' + this.currentPage + '&pagesize=' + this.pageSize;
    if (reset == false) {
      url =
        'eql/rule/?search=' +
        this.search_term +
        '&page=' +
        this.currentPage +
        '&pagesize=' +
        this.pageSize;
    } else {
      this.search_term = '';
    }
    let newRuleList: any = [];
    this._http.get(url).subscribe(
      (res:any) => {
        this.loading = true;
        if (res.status === true) {
          console.log('Fetched Rule List');
          
          // this.getRuleList = res.data;
          // this.totalItems = responseData.data.rules.total;
          this.loading = false;
          this.ruleList = res.data;
          this.ruleCount = res.data.total;
          this.filteredRuleCount = res.data.filtered;
          for (let i = 0; i < res.data.rules.length; i++) {
            if (res.data.rules[i]._source.eql) {
              continue;
            }
            const element = res.data.rules[i];
            newRuleList.push(element);
          }
          this.ruleList = newRuleList;

          const responseData = res;
          this.PageTotalNumber = [];
          let Count = responseData.data.total / 10;
          for (let i = 0; i < Count; i += this.PageJump) {
            this.PageTotalNumber.push(i);
          }
          this.pageSlice = this.ruleList;
          this.totalItems = responseData.data.total;
          this.loading = false;
         
          this.pageSlice = this.ruleList;
        }
      }
    );
  }

  currentPage: number = 0;
  totalItems: number | undefined;
  onPageChange(event: any, data: any) {
    if (data === '1') {
      this.currentPage = event;
      this.getRuleList(true)
    } else {
      this.currentPage = Number(event.target.value);
      this.getRuleList(true)
    }
  }

  statusChange(event: any, id: string, val: boolean) {
    console.log(event);
    if (val == true) {
      this.deactivateThisRule(id);
    } else if (val == false) {
      this.activateThisRule(id);
    }
  
  }
  selectThisRule(id: string) {
    this.theRuleId = id;
  }
  deleteThisRule(id: string) {
    this.loading = true;
    this._http.delete('eql/rule/' + id).subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
          setTimeout(() => {
            console.log('Timed Fetch');
            this.getRuleList(true);
          }, 500);
        }
      },
      (error) => {
        this.loading = false;
        alert(error.error.error);
        console.log(error);
        setTimeout(() => {
          console.log('Timed Fetch');
          this.getRuleList(true);
        }, 500);
      }
    );
  }
  activateThisRule(id: string) {
    this.loading = true;
    this._http.get('eql/rule/' + id + '/activate').subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
          // this.getRuleList();
          setTimeout(() => {
            console.log('Timed Fetch');
            this.getRuleList(true);
          }, 500);
        }
      },
      (error) => {
        this.loading = false;
        alert(error.error.error);
        console.log(error);
        setTimeout(() => {
          console.log('Timed Fetch');
          this.getRuleList(true);
        }, 500);
      }
    );
  }
  deactivateThisRule(id: string) {
    this.loading = true;
    this._http.get('eql/rule/' + id + '/deactivate').subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
          // this.getRuleList();
          setTimeout(() => {
            console.log('Timed Fetch');
            this.getRuleList(true);
          }, 500);
        }
      },
      (error) => {
        this.loading = false;
        alert(error.error.error);
        console.log(error);
        setTimeout(() => {
          console.log('Timed Fetch');
          this.getRuleList(true);
        }, 500);
      }
    );
  }

  activateRuleDetail() {
    this.activateRules();
    // this._auth.rulesIsActive();
    this.giveRulesName();
    this.router.navigate(['/rules/rule-detail', 'new']);
  }
  activateRules() {
    // this._auth.rulesIsActive();
    this.giveRulesName();
    // this.router.navigate(['main/dashboard']);
  }
  giveRulesName() {
    this.emitActiveTabName.emit('Rules');
  }

}