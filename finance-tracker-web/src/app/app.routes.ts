// Example: app-routes.ts
import { Routes } from '@angular/router';
import { ClerkAuthGuardService, catchAllRoute } from 'ngx-clerk';
import { HomePageComponent } from './pages/home-page/home-page';
import { SignInComponent } from './pages/sign-in/sign-in';
import { SignUpComponent } from './pages/sign-up/sign-up';
import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page';

export const routes: Routes = [
  {
    matcher: catchAllRoute('user'),
    component: UserProfilePageComponent,
    canActivate: [ClerkAuthGuardService],
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: '',
    component: HomePageComponent,
  },
];
