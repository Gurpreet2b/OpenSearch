import { DOCUMENT } from '@angular/common';
import { Component, DoCheck, Inject, OnChanges, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, HttpService } from 'src/app/core/services';
import $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {
  public loading = false;
  public name: string | null | undefined;
  public HeaderTitleName: any;
  public state: boolean = true;
  public SMTPSettingsForm: FormGroup;
  public submitted = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public authService: AuthService,
    private router: Router,
    private http: HttpService, private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    let UserName = this.authService.getUserName();
    this.name = UserName;

    this.SMTPSettingsForm = this.fb.group({
      smtp_server: ['', [Validators.required]],
      smtp_port: ['', [Validators.required]],
      smtp_use_ssl: [false],
      smtp_use_tls: [false],
      smtp_use_authentication: [false],
      smtp_username: ['', [Validators.required]],
      smtp_password: ['', [Validators.required]],
      smtp_from_address: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    });
  }

   // convenience getter for easy access to form fields
   get f() { return this.SMTPSettingsForm.controls; }

   onSubmitSMTP() {
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
    this.http.post('eql/smtp_details/', formData).subscribe((res: any) => {
      if (res.status === true) {
        const responseData = res.data;
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

  DismissSMTPEmail(){
    const target = "#scheduleMail";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
  }


  toggleSidebar() {
    this.state = !this.state;
    this.authService.setSidebarState(this.state);
  }

  ngDoCheck() {
    this.HeaderTitleName = this.authService.TitleName;
  }


  /**
   * Logout the current session
   */
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }


}
