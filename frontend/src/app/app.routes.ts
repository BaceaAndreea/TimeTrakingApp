import { Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {SignupComponent} from './components/signup/signup.component';
import {TicketComponent} from './components/ticket/ticket.component';
import {HolidaysComponent} from './components/holidays/holidays.component';
import {UpToDateComponent} from './components/up-to-date/up-to-date.component';

export let routes: Routes;
routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path: 'login', component: LoginComponent},
  { path: 'signup', component: SignupComponent },
  {path: 'home', component: HomeComponent},
  {path: 'tickets', component: TicketComponent},
  {path: 'holidays', component: HolidaysComponent},
  {path: 'up-to-date', component: UpToDateComponent},


];
