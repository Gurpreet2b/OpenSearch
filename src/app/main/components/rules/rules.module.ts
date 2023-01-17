import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RulesRoutingModule } from './rules-routing.module';
import { RulesComponent } from './components/rules.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RuleViewComponent } from './rule-view/rule-view.component';
import { HomeComponent } from './home/home.component';
// import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { ConfigurationsComponent } from './configurations/configurations.component';

export function translateHttpLoaderFactory() {
}

@NgModule({
  declarations: [RulesComponent, RuleViewComponent, HomeComponent, ConfigurationsComponent],
  imports: [
    CommonModule,
    RulesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
    // NgxChartsModule
  ],
})
export class RulesModule { }
