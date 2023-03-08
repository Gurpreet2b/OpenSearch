import { Component, OnInit } from '@angular/core';
import { AuthService, HttpService } from 'src/app/core/services';
import $ from 'jquery';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: 'app-frame-link',
  templateUrl: './frame-link.component.html',
  styleUrls: ['./frame-link.component.css']
})
export class FrameLinkComponent implements OnInit {

  public frameLink = "";
  constructor(private _http: HttpService, private _auth: AuthService, private router:Router, private sanitizer: DomSanitizer) {
    this._http.get(`eql/link_embed`).subscribe(
      (res) => {
        this.frameLink = res.data;
      },
      async (error) => {
        if (error.error.code === 'token_not_valid') {
          this._auth.logout();
          this.router.navigate(['/signin']);
          // this.onDismiss();
        } else {
          await new Promise((f) => setTimeout(f, 2000));
          console.log('Else Case')
          // this.onDismiss();
        }
      }
    );
   }
  ngOnInit(): void {
    
  }
  transform() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.frameLink
    );
  }
  onDismiss() {
    const target = "#PDFGenerateReport";
    $(target).hide();
    $('.modal-backdrop').remove();
    $("body").removeClass("modal-open");
    $("body").addClass("modal-overflow");
  }

}
