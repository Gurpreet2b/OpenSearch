import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RulesComponent } from './components/rules.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { HomeComponent } from './home/home.component';
import { RuleViewComponent } from './rule-view/rule-view.component';

const routes: Routes = [
  { path: '', component: RulesComponent },
  { path: 'rule-view/:id', component: RuleViewComponent },
  { path: 'rule-detail/:id', component: HomeComponent },
  { path: 'configurations', component: ConfigurationsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RulesRoutingModule { }
