import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './components/layout.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../../guards/auth.guard';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    LayoutComponent, 
    HeaderComponent, 
    SidebarComponent,
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    RouterModule,
    ToastrModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    AuthGuard
  ]
})
export class LayoutModule { }
