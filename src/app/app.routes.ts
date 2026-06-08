import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { VerifyCodeComponent } from './pages/verify-code/verify-code.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { SendersComponent } from './pages/senders/senders.component';
import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyCodeComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'senders', component: SendersComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
