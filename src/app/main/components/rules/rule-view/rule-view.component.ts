import { Component, OnInit } from '@angular/core';
import { HttpService, AuthService } from 'src/app/core/services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-rule-view',
  templateUrl: './rule-view.component.html',
  styleUrls: ['./rule-view.component.css'],
})
export class RuleViewComponent implements OnInit {
  public loading = true;
  public loading1 = true;
  // Update Parameters:-
  public exRuleId: any = '';
  //Creation Parameters:-

  public colorScheme: any = [];
  public valueSlid: any = '';
  public view: any = '';

  public active: boolean = false;
  public lastRun: any = '';
  public metadata: any = {};

  public quickPreviewTime = '';
  public previewLoading = false;
  public previewCount: number = 0;
  public previewData: any = [];
  public firstRun = true;

  public ruleType = 'Event Correlation';
  public indexPatterns: any = [];

  public currentIndex = '';
  public eqlQuery = 'any where true';

  public ruleName = '';
  public ruleDescription = '';
  public severity = 'Low';
  public minSlider = 1;
  public maxSlider = 30;
  public valueSlider = 1;
  public tags = '';
  public mitre: any = [];

  public investigation_guide = '';
  public author = '';
  public license = '';
  public rule_name_override = '';
  public timestamp_override = '';

  public runs_every_in = '';
  public runs_every = 10;
  public additional_loopback_in = '';
  public additional_loopback = 10;

  public actionVal = '';

  public tacticArray: any = [];
  public techniqueArray: any = [];
  public subtechniqueArray: any = [];

  public refArray: any = [];
  public falseArray: any = [];

  constructor(
    private _auth: AuthService,
    private _http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Rule-View`);
    // this._auth.rulesIsActive();
    this.exRuleId = this.route.snapshot.paramMap.get('id');
    this.getThisRuleDetails(this.exRuleId);
    // this.getThisRuleAlerts(this.exRuleId);
  }
  ngDoCheck(): void {}

  runItNow() {
    this.loading = true;
    let id = this.exRuleId;
    console.log('Timed Deactivation');
    this._http.get('eql/rule/' + id + '/deactivate').subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
          setTimeout(() => {
            console.log('Timed Activation');
            this.activateThisRule(this.exRuleId);
          }, 500);
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
        }
      }
    );
  }
  statusChange(event: any) {
    console.log(event);
    let id = this.exRuleId;
    let val = this.active;
    if (val == true) {
      this.deactivateThisRule(id);
    } else if (val == false) {
      this.activateThisRule(id);
    }
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
            this.getThisRuleDetails(this.exRuleId);
          }, 500);
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
        }
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
            this.getThisRuleDetails(this.exRuleId);
          }, 500);
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
        }
      }
    );
  }
  getThisRuleAlerts(id: string) {
    this._http.get('eql/alert/' + id).subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
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
        }
      }
    );
  }
  refreshThis() {
    this.getThisRuleDetails(this.exRuleId);
  }
  getThisRuleDetails(id: string) {
    this._http.get('eql/rule/' + id).subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
          this.indexPatterns = res.data._source.definition.index_pattern;
          this.eqlQuery = res.data._source.definition.eql_query;

          this.severity = res.data._source.options.severity;
          this.valueSlider = res.data._source.options.risk_score;
          this.ruleName = res.data._source.options.name;
          this.ruleDescription = res.data._source.options.description;
          this.tags = res.data._source.options.tags;

          this.refArray = res.data._source.options.advance.reference_url;
          this.falseArray = res.data._source.options.advance.false_positive;
          this.investigation_guide =
            res.data._source.options.advance.investigation_guide;
          this.author = res.data._source.options.advance.author;
          this.license = res.data._source.options.advance.license;
          this.mitre = res.data._source.options.advance.mitre;

          this.runs_every_in = res.data._source.schedule.runs_in;
          this.runs_every = res.data._source.schedule.runs_every;
          this.additional_loopback_in =
            res.data._source.schedule.additional_loop_back_in;
          this.additional_loopback =
            res.data._source.schedule.additional_loop_back;

          this.active = res.data._source.active;
          this.lastRun = res.data._source.last_run;

          if (res.data._source.hasOwnProperty('meta')) {
            this.metadata = res.data._source.meta;
          } else {
            this.metadata = {
              created: '1970-11-31T12:16:15.366Z',
              updated: '1970-11-31T12:16:15.366Z',
              last_run: '1970-11-31T12:16:15.366Z',
              last_alert: '1970-11-31T12:16:15.366Z',
            };
          }
          let timestamp = 1646310439.93681;
          var date = new Date(timestamp * 1000).toISOString();
          console.log(date); //4/17/2020
          this.actionVal = res.data._source.actions.action;

          if (this.refArray.length == 0) {
            console.log('dfs');
          }
          if (this.falseArray.length == 0) {
            console.log('dfs-1');
          }
          if (typeof this.indexPatterns == 'string') {
            this.indexPatterns = [this.indexPatterns];
          }
          this.loading = false;
          console.log(this.mitre);
          if (res.data._source.options.advance.mitre) {
            this.tacticArray = res.data._source.options.advance.mitre.tactics;
            this.techniqueArray =
              res.data._source.options.advance.mitre.techniques;
            this.subtechniqueArray =
              res.data._source.options.advance.mitre.subtechniques;
          }
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
        }
      }
    );
  }
  editThisRule() {
    this.router.navigate(['/rules/rule-detail', this.exRuleId]);
  }

  goBack() {
    this.router.navigate(['/rules']);
  }
}
