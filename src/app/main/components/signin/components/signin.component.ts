import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpService, AuthService } from 'src/app/core/services';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  public loading: boolean = false;
  constructor(
    private router: Router,
    private _auth: AuthService,
    private _http: HttpService
  ) { }

  ngOnInit(): void {}
  startLogin(user: string, pass: string) {
    // console.log('Login Started');
    // if (user == '' || pass == '') {
    //   alert('please Fill all the fields');
    //   return;
    // }
    // if (this._auth.loginTest(user, pass)) {
    //   this.openDashboard();
    // } else {
    //   alert('Credential Mismatch');
    // }
  }
  loginapi(user: string, pass: string) {
    if (user == '' || pass == '') {
      alert('Please Fill the Credentials');
      return;
    }
    const data = {
      data: {
        user:btoa(user),
        pass: btoa(pass),
      },
    };
    this.loading = true;
    this._http.post('eql/login', data).subscribe(
      (res) => {
        if (res.status) {
          // debugger;
          // console.log(res);
          const obj = JSON.parse(res.data);
        let UserName = user;
        // let StartPage = '/' + res.user.start_page;
        this._auth.setUserName(UserName); 
        this._auth.setCurrentUser({ token: obj.token });
          this.router.navigate(['/dashboard']);

          // const obj = JSON.parse(res.data);
          // console.log(obj);
          // if (obj.token.length > 0) {
          //   // this._auth.loggedIn();
          //   // localStorage.setItem('token', obj.token);
          //   this._auth.setCurrentUser({ token: res.token });
          //   this._auth.setUserName(user);
          //   // this._auth.dashboardIsActive();
          //   // this._auth.rulesIsActive();
          //   this.router.navigate(['/dashboard']);
          //   this.loading = false;
          // } else {
          //   this.loading = false;
          //   alert('Authentication Failed');
          // }
          // this.setDashboardIds(res.data);
        }
      },
      (error) => {
        this.loading = false;
        alert(error.error.error);
        console.log(error);
      }
    );
  }

}
