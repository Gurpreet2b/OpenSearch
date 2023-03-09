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
