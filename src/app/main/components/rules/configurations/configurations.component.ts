import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpService, AuthService } from 'src/app/core/services';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.css']
})
export class ConfigurationsComponent implements OnInit {

  constructor(private _http: HttpService,private _auth: AuthService,
    private authService: AuthService) { }
  @ViewChild('dialogRef')
  dialogRef!: TemplateRef<any>;

  ngOnInit(): void {
    this.authService.SetHeaderTitleName(`Configurations`);
    // this._auth.rulesIsActive();
    this.getConfigs();
  }
  // public selectedConfig = '';
  myFooList = ['Some Item', 'Item Second', 'Other In Row', 'What to write', 'Blah To Do']

  public newConfigName = '';
  public newConfigUrl = '';
  public newConfigKey = '';
  public newConfigMail = '';
  public newConfigAssignee = '';
  public newConfigAp = '';

  public configs:any = [];
  public selectedConfig:any = []


  // openDialog() {
  //   // this.selectedConfig = 'df';
  //   const myTempDialog = this.dialog.open(this.dialogRef, { data: this.myFooList });
  //   // myTempDialog.afterClosed().subscribe((result) => {
  //   //   console.log(result);
  //   //   let configData = {
  //   //     "name":this.newConfigName,
  //   //     "url":this.newConfigUrl,
  //   //     "projectkey":this.newConfigKey,
  //   //     "usermail":this.newConfigMail,
  //   //     "assignee":this.newConfigAssignee,
  //   //     "key":this.newConfigAp
  //   //   }
  //   //   console.log(configData);
  //   //   if (result=='true') {
  //   //     alert(result);
  //   //   }
  //   // });
  // }
  getConfigs() {
    this._http.get('eql/config').subscribe(
      res => {
        if (res.status) {
          this.configs = res.data;
        }
      },
      err => console.log(err)
    )
  }
  selectThisConfig(i:number){
    this.selectedConfig = this.configs[i]["_source"];
  }
  createConfig(){
    let st = this.newConfigMail+':'+this.newConfigAp;
    console.log(st)
    let encoded: string = btoa(st);
    console.log(encoded)
    let configData = {
      "platform":'jira',
      "name":this.newConfigName,
      "url":this.newConfigUrl,
      "projectkey":this.newConfigKey,
      "usermail":this.newConfigMail,
      "assignee":this.newConfigAssignee,
      "auth":encoded
    }
    this._http.post('eql/config', configData).subscribe(
      (res) => {
        if (res.status) {
          // console.log(res);
          // this.openDialog()
          console.log(res);
          this.resetFields()
        }
      },
      error => {
        console.log(error);
        alert(error.error.error);
      }
    )
  }
  resetFields() {
    this.newConfigName = '';
    this.newConfigUrl = '';
    this.newConfigKey = '';
    this.newConfigMail = '';
    this.newConfigAssignee = '';
    this.newConfigAp = '';
  }


}
