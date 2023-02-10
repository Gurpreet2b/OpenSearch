
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpService, AuthService } from 'src/app/core/services';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  url: string;
  constructor(
    public sanitizer: DomSanitizer,
    private _auth: AuthService,
    private _http: HttpService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}
  form!: FormGroup;

  // Update Parameters:-
  public exRuleId: any = '';
  //Creation Parameters:-
  // url: string = this._auth.getUrl();
  // url: string = ;

  urlSafe: SafeResourceUrl = '';

  public colorScheme: any = [];
  public valueSlid: any = '';
  public view: any = '';

  public active: boolean = false;

  public quickPreviewTime = '';
  public previewLoading = false;
  public previewCount: number = 0;
  public previewData: any = [];
  public firstRun = true;

  public ruleType = 'Event Correlation';
  public indexPatterns: any = [];
  public selectedIndices: any = [];

  public currentIndex = '';
  public eqlQuery = 'event where condition';

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
  public runs_every = 5;
  public additional_loopback_in = '';
  public additional_loopback = 4;

  public actionVal = '';
  public ticketFlag: any = false;
  public ticketPlatform = '';

  public ticketConfig = '';
  public ticketConfigId = '';

  public ticketConfigs: any = [];
  public ticketConfigIds: any = [];

  public tacticArray: any = [];
  public techniqueArray: any = [];
  public subtechniqueArray: any = [];

  public pretacticArray: any = [];
  public pretechniqueArray: any = [];
  public presubtechniqueArray: any = [[[]]];

  public refArray: any = [];
  public falseArray: any = [];
  temptech = [1, 2, 3, 4, 5];

  // for debounce time
  public syntax_state: string = 'red';
  public syntax_message: string = '-SYNTAX_CHECK_01-';
  subject: Subject<any> = new Subject();

  public created: any = '-';
  public updated: any = '-';
  public last_run: any = '-';
  public last_result: any = '-';
  public last_alert: any = '-';
  public version: any = 1;

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Rule-details`);
    this.getIndexPatterns();
    this.getTicketConfigs();
    this.getTacticList();
    this.addtactic();
    this.addRef();
    this.addFalse();
    // this._auth.rulesIsActive();

    this.exRuleId = this.route.snapshot.paramMap.get('id');
    console.log('rule - ' + this.exRuleId);
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

    this.severity = 'Low';
    this.valueSlider = 1;
    this.setMinMax();

    if (this.exRuleId != 'new') {
      this.getThisRuleDetails(this.exRuleId);
    }

    //for debounce time
    this.subject.pipe(debounceTime(500)).subscribe((term) => {
      // let converted = term.replace('eq', '==');
      // console.log(converted);
      const data = { eql_query: term };
      this._http.post('eql/rule/check_query/', data).subscribe(
        (res) => {
          if (res.status) {
            console.log(res);
            if (res.data == 'Valid') {
              this.syntax_state = 'green';
              this.syntax_message = res.data;
            } else {
              this.syntax_state = 'red';
              // replace all == with eq
              this.syntax_message = res.data.replace('==', 'eq');
              console.log(this.syntax_message);
              // alert(res.data);
            }
          }
        },
        (error) => {
          if (error.error.code === 'token_not_valid') {
            this._auth.logout();
            this.router.navigate(['/signin']);
            alert('An Error Occured\n' + error.error.error);
            // alert(error.error.error);
          } else {
            alert('An Error Occured\n' + error.error.error);
          }
        }
      );
    });
    this.exclusiveSyntaxCheck();
  }

  //for debounce time
  onKeyUp(event: any): void {
    this.subject.next(event.srcElement.value);
  }

  exclusiveSyntaxCheck() {
    setTimeout(() => {
      const data = { eql_query: this.eqlQuery };
      this._http.post('eql/rule/check_query/', data).subscribe(
        (res) => {
          if (res.status) {
            console.log(res);
            if (res.data == 'Valid') {
              this.syntax_state = 'green';
              this.syntax_message = res.data;
            } else {
              this.syntax_state = 'red';
              this.syntax_message = res.data.trim().replace('==', 'eq');
              // alert(res.data);
            }
          }
        },
        (error) => {
          if (error.error.code === 'token_not_valid') {
            this._auth.logout();
            this.router.navigate(['/signin']);
            alert('An Error Occured\n' + error.error.error);
            // alert(error.error.error);
          } else {
            alert('An Error Occured\n' + error.error.error);
          }
        }
      );
    }, 1000);
  }
  // ngDoCheck() {
  //   this.setMinMax();
  // }
  //to Add and Remove index pattern with For Loop on click of the button
  addIndex() {
    this.selectedIndices.push({ name: '' });
    // console.log(this.selectedIndices);
  }
  removeIndex(i: number) {
    this.selectedIndices.splice(i, 1);
  }
  //To add and remove reference url on click of button
  addRef() {
    // console.log('called add reference');

    this.refArray.push({ name: '' });
    // console.log(this.refArray);
  }
  removeRef(i: number) {
    this.refArray.splice(i, 1);
  }
  //to add and remove false positive on click of the button
  addFalse() {
    this.falseArray.push({ name: '' });
  }
  removeFalse(i: number) {
    this.falseArray.splice(i, 1);
  }
  //add Tactic field on click of addTactic button
  addtactic() {
    this.tacticArray.push({ name: '', id: '' });
    this.techniqueArray.push([{ name: '', id: '' }]);
    this.subtechniqueArray.push([[{ name: '' }]]);
  }
  //add Techniquefield under particular tactic
  addtechnique(i: number) {
    this.techniqueArray[i].push({ name: '', id: '' });
    this.subtechniqueArray[i].push([{ name: '' }]);
    // this.techniqueArray[i].push([{name:''}]);
    // this.subtechniqueArray[i].push([[{name:''}]]);
  }
  //add subtchnique under particular technique under particular tactic
  addsubtechnique(i: number, j: number) {
    this.subtechniqueArray[i][j].push({ name: '' });
  }
  //remove specific tactic and all its techniques and subtechniques
  removetactic(i: number) {
    this.tacticArray.splice(i, 1);
    this.techniqueArray.splice(i, 1);
    this.subtechniqueArray.splice(i, 1);
  }
  //remove a particular tactic's tachniques and subtechniques
  removetechnique(i: number, j: number) {
    this.techniqueArray[i].splice(j, 1);
    this.subtechniqueArray[i].splice(j, 1);
  }
  //remove a particular tactic's particular techniques's subtechnique
  removesubtechnique(i: number, j: number, k: number) {
    this.subtechniqueArray[i][j].splice(k, 1);
  }

  logAttack() {
    let tactic = [
      {
        tactic: '',
        techniques: [
          {
            technique: '',
            subtechniques: [
              {
                subtechnique: '',
              },
            ],
          },
        ],
      },
    ];
    for (let i = 0; i < this.tacticArray.length; i++) {
      // console.log('i: ',i);
      if (i == 0) {
        tactic[i].tactic = this.tacticArray[i].name;
      } else {
        tactic.push({
          tactic: this.tacticArray[i].name,
          techniques: [
            {
              technique: '',
              subtechniques: [
                {
                  subtechnique: '',
                },
              ],
            },
          ],
        });
      }
      tactic[i].tactic = this.tacticArray[i].name;
      for (let j = 0; j < this.techniqueArray[i].length; j++) {
        // console.log('j: ',j);
        if (j == 0) {
          tactic[i].techniques[j].technique = this.techniqueArray[i][j].name;
        } else {
          tactic[i].techniques.push({
            technique: this.techniqueArray[i][j].name,
            subtechniques: [{ subtechnique: '' }],
          });
        }
        for (let k = 0; k < this.subtechniqueArray[i][j].length; k++) {
          // console.log('k: ',k);
          if (k == 0) {
            tactic[i].techniques[j].subtechniques[k].subtechnique =
              this.subtechniqueArray[i][j][k].name;
          } else {
            tactic[i].techniques[j].subtechniques.push({
              subtechnique: this.subtechniqueArray[i][j][k].name,
            });
          }
        }
      }
    }
    // console.log(tactic);
    // this.mitre = tactic;
    console.log(this.tacticArray);
    console.log(this.techniqueArray);
    console.log(this.subtechniqueArray);
  }

  logslider() {
    console.log(this.valueSlider);
  }
  logslider2() {
    console.log(this.valueSlid);
  }
  slidechange(value: any) {
    this.valueSlider = value.target.value;
    console.log(this.valueSlider);
  }

  sliderChangeDropdown(){
    
  }

  getframe() {
    return this.url;
  }

  logIndices() {
    console.log(this.selectedIndices);
  }
  getIndexPatterns() {
    let i = 0;
    this._http.get('eql/index_pattern').subscribe(
      (res) => {
        if (res.status) {
          this.currentIndex = res.data[0].attributes.title;
          for (i = 0; i < res.data.length; i++) {
            this.indexPatterns.push(res.data[i].attributes.title);
          }
        }
        if (this.exRuleId == 'new') {
          this.selectedIndices.push({ name: this.indexPatterns[0] });
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  getTicketConfigs() {
    let i = 0;
    this._http.get('eql/config').subscribe(
      (res) => {
        if (res.status) {
          // this.currentIndex = res.data[0].attributes.title;
          for (i = 0; i < res.data.length; i++) {
            this.ticketConfigs.push(res.data[i]._source.name);
            this.ticketConfigIds.push(res.data[i]._id);
          }
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  //fetch the list of all tactics
  getTacticList() {
    this._http.get('eql/rule/get_tactic').subscribe(
      (res) => {
        if (res.status) {
          this.pretacticArray = res.data;
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  getTechniquesOfTactic(tactic: any, tacticIndex: number, clear = true) {
    let tact = tactic.split('-');
    // console.log(tactic);
    // console.log(tact);

    this._http.get('eql/rule/get_technique/?tactic=' + tact[0]).subscribe(
      (res) => {
        if (res.status) {
          this.pretechniqueArray[tacticIndex] = res.data;
          this.presubtechniqueArray[tacticIndex] = [[]];
          // this.techniqueArray.push([{name:'',id:''}]);
          if (clear) {
            this.techniqueArray[tacticIndex] = [{ name: '', id: '' }];
            // this.subtechniqueArray.push([[{name:''}]]);
            this.subtechniqueArray[tacticIndex] = [[{ name: '', id: '' }]];
          }
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  getSubtechniquesofTechnique(
    technique: string,
    tacticIndex: number,
    techniqueIndex: number,
    clear = true
  ) {
    // console.log(technique,tacticIndex,techniqueIndex);
    let tech = technique.split('-');
    // console.log(technique);
    // console.log(tech);

    this._http.get('eql/rule/get_subtechnique/?technique=' + tech[0]).subscribe(
      (res) => {
        if (res.status) {
          // console.log(res);
          // this.presubtechniqueArray[tacticIndex][techniqueIndex] = res.data;
          this.presubtechniqueArray[tacticIndex][techniqueIndex] = res.data;
          // this.subtechniqueArray[tacticIndex][techniqueIndex]=[{name:'',id:''}];
          if (clear) {
            this.subtechniqueArray[tacticIndex][techniqueIndex] = [
              { name: '', id: '' },
            ];
          }
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  makeIndices(indices: any) {
    console.log(this.selectedIndices);
    console.log('indices has following indices');
    for (let i = 0; i < indices.length; i++) {
      console.log(indices[i]);
      this.selectedIndices.push({ name: indices[i] });
    }
  }
  getThisRuleDetails(id: string) {
    this._http.get('eql/rule/' + id).subscribe(
      (res) => {
        if (res.status) {
          // console.log(res);
          let indices = res.data._source.definition.index_pattern;
          // let indices = [];
          this.selectedIndices = [];
          this.makeIndices(indices);

          console.log(this.selectedIndices.length);
          this.eqlQuery = res.data._source.definition.eql_query;

          this.severity = res.data._source.options.severity;
          this.valueSlider = res.data._source.options.risk_score;
          this.ruleName = res.data._source.options.name;
          this.ruleDescription = res.data._source.options.description;
          this.tags = res.data._source.options.tags.join('\n');

          this.refArray = res.data._source.options.advance.reference_url;
          this.falseArray = res.data._source.options.advance.false_positive;
          this.investigation_guide =
            res.data._source.options.advance.investigation_guide;
          this.author = res.data._source.options.advance.author;
          this.license = res.data._source.options.advance.license;

          this.runs_every_in = res.data._source.schedule.runs_in;
          this.runs_every = res.data._source.schedule.runs_every;
          this.additional_loopback_in =
            res.data._source.schedule.additional_loop_back_in;
          this.additional_loopback =
            res.data._source.schedule.additional_loop_back;

          this.active = res.data._source.active;
          this.actionVal = res.data._source.actions.action;
          if (res.data._source.actions.config) {
            this.ticketFlag = res.data._source.actions.config.send;
            this.ticketPlatform = res.data._source.actions.config.platform;
            this.ticketConfig = res.data._source.actions.config.config_name;
          }

          this.created = res.data._source.meta.created;
          this.updated = res.data._source.meta.updated;
          this.last_run = res.data._source.meta.last_run;
          this.last_result = res.data._source.meta.last_result;
          this.last_alert = res.data._source.meta.last_alert;
          this.version = res.data._source.meta.version;

          this.prepareMitre2(res.data._source.options.advance.mitre);
          // this.prepareMitre(res.data._source.options.advance.mitre);

          if (this.refArray.length == 0) {
            this.addRef();
          }
          if (this.falseArray.length == 0) {
            this.addFalse();
          }
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  prepareMitre2(mitre: any) {
    console.log('preparing');
    try {
      this.tacticArray = mitre.tactics;
      this.techniqueArray = mitre.techniques;
      this.subtechniqueArray = mitre.subtechniques;
      this.getOptionsforMitre();
    } catch (error) {
      console.log(error);
    }
  }
  prepareMitre(tactics: any) {
    // console.log(tactics);

    let finalTacticArray = [];
    let finalTechniqueArray: any = [];
    let finalSubtechniqueArray = [];
    for (let i = 0; i < tactics.length; i++) {
      const tactic = tactics[i];
      let tacticPieces = tactic.tactic;
      // let tacticPieces = tactic.tactic.split('-');
      // let tacticId = tacticPieces.splice(0, 1)[0];
      // tacticPieces = tacticPieces.join('-');
      // tacticPieces = tacticPieces + '-' + tacticId;

      // finalTacticArray.push({name:tacticPieces,id:''});
      let tacticId = tacticPieces.split('-')[0];
      if (i == 0) {
        this.tacticArray[0] = { name: tacticPieces, id: '' };
      } else {
        this.addtactic();
        this.tacticArray[i] = { name: tacticPieces, id: '' };
        // finalTechniqueArray[i].push({name:tacticPieces,id:''});
      }

      for (let j = 0; j < tactic.techniques.length; j++) {
        const technique = tactic.techniques[j];
        // console.log(technique);

        let techniquePieces = technique.technique;
        // let techniquePiecesSplitted = technique.technique.split('-');
        // let techniquePiecesSplitted = techniquePieces.split('-');
        // let techniqueId = techniquePiecesSplitted.splice(0, 1)[0];

        // techniquePieces = techniquePieces.join('-');
        // techniquePieces = techniquePieces + '-' + techniqueId;
        let techniqueId = techniquePieces.split('-')[0];
        // console.log(techniquePieces);
        if (j == 0) {
          this.techniqueArray[i][0] = { name: techniquePieces, id: '' };
          // finalTechniqueArray.push([{name:techniquePieces,id:''}]);
        } else {
          this.addtechnique(i);
          this.techniqueArray[i][j] = { name: techniquePieces, id: '' };
          // finalTechniqueArray[i].push({name:techniquePieces,id:''});
        }

        for (let k = 0; k < technique.subtechniques.length; k++) {
          const subtechnique = technique.subtechniques[k];
          // console.log(subtechnique);
          // console.log('i:',i,'j:',j,'k:',k);
          // let subtechniquePieces = subtechnique.subtechnique.split('-');
          // let subtechniqueId = subtechniquePieces.splice(0, 1)[0];
          // subtechniquePieces = subtechniquePieces.join('-');
          // subtechniquePieces = subtechniquePieces + '-' + subtechniqueId;
          let subtechniquePieces = subtechnique.subtechnique;

          if (k == 0) {
            this.subtechniqueArray[i][j][0] = {
              name: subtechniquePieces,
              id: '',
            };
            // finalTechniqueArray.push([{name:techniquePieces,id:''}]);
          } else {
            this.addsubtechnique(i, j);
            this.subtechniqueArray[i][j][k] = {
              name: subtechniquePieces,
              id: '',
            };
            // finalTechniqueArray[i].push({name:techniquePieces,id:''});
          }
        }
      }
    }

    // console.log('tactics:',finalTacticArray);
    // console.log('techniques:',finalTechniqueArray);
    // console.log('tactic:',this.tacticArray);
    // console.log('technique:',this.techniqueArray);
    // console.log('subtechnique:',this.subtechniqueArray);

    // this.tacticArray = finalTacticArray;
    // this.techniqueArray = finalTechniqueArray;
    this.getOptionsforMitre();
  }
  getOptionsforMitre() {
    setTimeout(() => {
      console.log('Timed option Fetch');
      for (let i = 0; i < this.tacticArray.length; i++) {
        const element = this.tacticArray[i];
        // console.log(element);
        let tactId = element.name.split('-')[0];
        this.getTechniquesOfTactic(tactId, i, false);
      }
    }, 500);
    setTimeout(() => {
      for (let i = 0; i < this.techniqueArray.length; i++) {
        const technique = this.techniqueArray[i];
        for (let j = 0; j < technique.length; j++) {
          const element = technique[j];
          let techniqueId = element.name.split('-')[0];
          this.getSubtechniquesofTechnique(techniqueId, i, j, false);
          // console.log(element);
        }
      }
    }, 1000);
  }
  updateRule() {
    this.logAttack();
    let tagArray = this.tags.split('\n');
    let indices = [];
    for (let i = 0; i < this.selectedIndices.length; i++) {
      indices.push(this.selectedIndices[i]['name']);
    }
    let tickData: any = [];
    let configId = '';
    let ind = this.ticketConfigs.indexOf(this.ticketConfig);
    let id = this.ticketConfigIds[ind];

    if (this.actionVal != 'Perform No Action') {
      console.log('tickData changed');

      tickData = {
        send: String(this.ticketFlag),
        platform: this.ticketPlatform,
        config_name: this.ticketConfig,
        config_id: id,
      };
    }
    const document = {
      active: this.active,
      definition: {
        index_pattern: indices,
        eql_query: this.eqlQuery,
      },
      options: {
        name: this.ruleName,
        description: this.ruleDescription,
        severity: this.severity,
        risk_score: this.valueSlider,
        tags: tagArray,
        advance: {
          reference_url: this.refArray,
          false_positive: this.falseArray,
          investigation_guide: this.investigation_guide,
          author: this.author,
          license: this.license,
          rule_name_override: '',
          timestamp_override: '',
          mitre: {
            tactics: this.tacticArray,
            techniques: this.techniqueArray,
            subtechniques: this.subtechniqueArray,
          },
        },
      },
      schedule: {
        runs_every: this.runs_every,
        runs_in: this.runs_every_in,
        additional_loop_back: this.additional_loopback,
        additional_loop_back_in: this.additional_loopback_in,
      },
      actions: {
        action: this.actionVal,
        config: tickData,
      },
      meta: {
        created: this.created,
        updated: new Date().toISOString(),
        last_run: this.last_run,
        last_result: this.last_result,
        last_alert: this.last_alert,
        version: this.version + 1,
      },
    };
    const data = {
      document: document,
    };
    console.log(document);
    console.log(data);
    this._http.put('eql/rule/' + this.exRuleId + '/', data).subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
          alert('This rule has been Updated');
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }

  createRule() {
    // this.logAttack();
    let tagArray = this.tags.split('\n');
    // let tagArray = this.tags.split(',');
    let indices = [];
    for (let i = 0; i < this.selectedIndices.length; i++) {
      indices.push(this.selectedIndices[i]['name']);
    }
    // console.log(indices);
    let tickData: any = [];
    let configId = '';
    let ind = this.ticketConfigs.indexOf(this.ticketConfig);
    let id = this.ticketConfigIds[ind];

    if (this.actionVal != 'Perform No Action') {
      console.log('tickData changed');

      tickData = {
        send: String(this.ticketFlag),
        platform: this.ticketPlatform,
        config_name: this.ticketConfig,
        config_id: id,
      };
    }
    const data = {
      active: this.active,
      definition: {
        index_pattern: indices,
        eql_query: this.eqlQuery,
      },
      options: {
        name: this.ruleName,
        description: this.ruleDescription,
        severity: this.severity,
        risk_score: this.valueSlider,
        tags: tagArray,
        advance: {
          reference_url: this.refArray,
          false_positive: this.falseArray,
          investigation_guide: this.investigation_guide,
          author: this.author,
          license: this.license,
          rule_name_override: '',
          timestamp_override: '',
          mitre: {
            tactics: this.tacticArray,
            techniques: this.techniqueArray,
            subtechniques: this.subtechniqueArray,
          },
        },
      },
      schedule: {
        runs_every: this.runs_every,
        runs_in: this.runs_every_in,
        additional_loop_back: this.additional_loopback,
        additional_loop_back_in: this.additional_loopback_in,
      },
      actions: {
        action: this.actionVal,
        config: tickData,
      },
      meta: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        last_run: '-',
        last_result: '-',
        last_alert: '-',
        version: 1,
      },
    };
    console.log(data);
    this._http.post('eql/rule/', data).subscribe(
      (res) => {
        if (res.status) {
          console.log(res);
          alert('This rule has been Added to list');
          this.resetFields();
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  resetFields() {
    // console.log('Fields Reset');
    this.view = '';

    this.active = false;

    this.quickPreviewTime = '';
    this.previewLoading = false;
    this.previewCount = 0;
    this.previewData = [];
    this.firstRun = true;

    this.ruleType = 'Event Correlation';
    this.indexPatterns = [];
    this.selectedIndices = [];

    this.currentIndex = '';
    this.eqlQuery = '';

    this.ruleName = '';
    this.ruleDescription = '';
    this.severity = 'Low';
    this.minSlider = 1;
    this.maxSlider = 30;
    this.valueSlider = 1;
    this.tags = '';
    this.mitre = [];

    this.investigation_guide = '';
    this.author = '';
    this.license = '';
    this.rule_name_override = '';
    this.timestamp_override = '';

    this.runs_every_in = '';
    this.runs_every = 5;
    this.additional_loopback_in = '';
    this.additional_loopback = 4;

    this.actionVal = '';

    this.tacticArray = [];
    this.techniqueArray = [];
    this.subtechniqueArray = [];

    this.pretechniqueArray = [];
    this.presubtechniqueArray = [];

    this.refArray = [];
    this.falseArray = [];
    this.ticketFlag = false;
    this.ticketPlatform = '';
    this.ticketConfig = '';

    this.getIndexPatterns();

    this.addtactic();
    this.addRef();
    this.addFalse();

    this.setMinMax();
  }

  quickPreview() {
    this.previewLoading = true;
    this.firstRun = false;
    let time = 0;
    if (this.quickPreviewTime == 'Last Hour') {
      time = 3600;
    } else if (this.quickPreviewTime == 'Last Day') {
      time = 86400;
    }
    // else if (this.quickPreviewTime == 'Last Week') {
    //   time = 604800;
    // }
    let indList = [];
    for (let i = 0; i < this.selectedIndices.length; i++) {
      const indObj = this.selectedIndices[i];
      indList.push(indObj.name);
    }
    const data = {
      query: this.eqlQuery,
      index_name: this.selectedIndices[0]['name'],
      loopback_time: time,
    };
    this._http.post('eql/rule/preview/', data).subscribe(
      (res) => {
        if (res.status) {
          // console.log(res);
          this.previewCount = res.data.length;
          this.previewLoading = false;
          // this.generateChartData(res.data);
          this.createChartData(res.data);
        }
      },
      (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          alert('An Error Occured\n' + error.error.error);
          // alert(error.error.error);
        } else {
          alert('An Error Occured\n' + error.error.error);
        }
      }
    );
  }
  createChartData(rawData: any) {
    this.previewData = [];

    if (rawData.length == 0) {
      return;
    }
    const uniqueTime = this.dp.transform(rawData[0]['@timestamp'], 'medium');
    let chartKey: any = [];
    let chartValue: any = [];
    chartKey.push(uniqueTime);
    chartValue.push(1);

    for (let i = 1; i < rawData.length; i++) {
      const element = rawData[i];
      // console.log(this.dp.transform(rawData[i]['@timestamp'], 'medium'))
      const count = rawData.filter(
        (obj: any) => obj['@timestamp'] == rawData[i]['@timestamp']
      ).length;
      const recordTime = this.dp.transform(rawData[i]['@timestamp'], 'medium');

      if (chartKey.includes(recordTime)) {
        // console.log('Includes')
        let index = chartKey.indexOf(recordTime);
        chartValue[index] = chartValue[index] + 1;
      } else {
        // console.log('Not Includes')
        chartKey.push(recordTime);
        chartValue.push(count);
      }
    }
    // console.log(chartKey);
    // console.log(chartValue);

    let chartData = [];
    for (let i = 0; i < chartKey.length; i++) {
      chartData.push({ name: chartKey[i], value: chartValue[i] });
      this.colorScheme.push({ name: chartKey[i], value: '#2196f1' });
    }
    // console.log(chartData);
    this.previewData = chartData;
    // this.previewData.push({name:'Dec 12',value:29});
  }

  generateChartData(rawData: any) {
    let final = rawData;
    let temptime: string | null = '';

    if (rawData.length == 0) {
      return;
    }
    if (rawData.length > 0) {
      let temptemptime = rawData[0]['@timestamp'];
      temptime = this.dp.transform(temptemptime, 'medium');
    }
    // const count = final.filter((obj: { [x: string]: any; }) => obj['@timestamp'] == rawData[0]['@timestamp']).length;
    const count = final.filter((obj: any) => {
      obj['@timestamp'] == rawData[0]['@timestamp'];
    }).length;
    // console.log(count);

    const uniqueTime = this.dp.transform(rawData[0]['@timestamp'], 'medium');
    let chartData: any = [];
    chartData.push({ name: uniqueTime, value: 1 });
    for (let i = 1; i < rawData.length; i++) {
      const recordTime = this.dp.transform(rawData[i]['@timestamp'], 'medium');

      // if(chartData.includes(recordTime)){
      //   console.log('True');
      // }

      for (let j = 0; j < chartData.length; j++) {
        const item = chartData[j];
        if (recordTime == item.name) {
          let cnt = item.value;
          cnt = cnt + 1;
          item.value = cnt;
          break;
        }
      }
    }

    var output: any = {};
    final.forEach((item: { name: string | number; number: any }) => {
      if (output[item.name]) {
        output[item.name] += item.number;
      } else {
        output[item.name] = item.number;
      }
    });
    // console.log(output);
  }
  setMinMax() {
    // let val = event.target.value;
    if (this.severity == 'Low') {
      this.minSlider = 1;
      this.maxSlider = 30;
      this.valueSlider = 1;
    } else if (this.severity == 'Medium') {
      this.minSlider = 31;
      this.maxSlider = 60;
      this.valueSlider = 31;
    } else if (this.severity == 'High') {
      this.minSlider = 61;
      this.maxSlider = 80;
      this.valueSlider = 61;
    } else if (this.severity == 'Critical') {
      this.minSlider = 81;
      this.maxSlider = 100;
      this.valueSlider = 81;
    }
    // if (this.valueSlider < this.minSlider) {
    //   this.valueSlider = this.minSlider;
    // }
    // if (this.valueSlider > this.maxSlider) {
    //   this.valueSlider = this.maxSlider;
    // }
    // console.log(this.minSlider);
    // console.log(this.maxSlider);
  }
  navigateToConfigs() {
    this.router.navigate(['/rules/configurations']);
  }
}
class attackModel {
  tactic: string = '';
  technique = [''];
  subtechnique: string = '';
}
class attackTech {
  technique = [['']];
}
class attackSubtech {
  subTechnique = [[['']]];
}
