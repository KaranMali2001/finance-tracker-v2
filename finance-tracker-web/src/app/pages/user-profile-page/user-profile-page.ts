import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import type { internal_domain_auth_GetAuthUserResponse } from '../../../api/models/internal_domain_auth_GetAuthUserResponse';
import { ErrorDisplayComponent } from '../../components/error-display/error-display';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

import { from } from 'rxjs';
import { AuthService } from '../../../api';
import { ToastService } from '../../services/toast/toast.service';
import { useAsyncState } from '../../utils/async-state.util';

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [LoadingSpinnerComponent, ErrorDisplayComponent, CurrencyPipe, DatePipe],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss',
})
export class UserProfilePageComponent implements OnInit {
  constructor(private toastService: ToastService) {}
  userState = useAsyncState<internal_domain_auth_GetAuthUserResponse>({
    // Called when user data is successfully loaded
    onSuccess: () => {
      this.toastService.success('User profile loaded successfully');
    },
    // Called when an error occurs - ToastService handles all error logic automatically
    onError: (error) => {
      this.toastService.showApiError(error);
    },
  });

  ngOnInit(): void {
    // Load user data - this will automatically handle loading/error states
    this.userState.load(from(AuthService.getAuthUser()));
  }

  onRetry(): void {
    this.toastService.info('Retrying to load user profile...', 'Loading');
    this.userState.load(from(AuthService.getAuthUser()));
  }
}
