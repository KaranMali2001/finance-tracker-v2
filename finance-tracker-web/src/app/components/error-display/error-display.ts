import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ParsedApiError } from '../../models/api-error.model';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatListModule],
  templateUrl: './error-display.html',
  styleUrl: './error-display.scss',
})
export class ErrorDisplayComponent {
  error = input.required<ParsedApiError>();
  showRetry = input(true);
  showDetails = input(false);

  onRetry = output<void>();

  getErrorIcon(): string {
    if (this.error().isNetworkError) return 'cloud_off';
    if (this.error().isServerError) return 'error_outline';
    if (this.error().status === 401) return 'lock_outline';
    if (this.error().status === 403) return 'block';
    if (this.error().status === 404) return 'search_off';
    return 'error_outline';
  }

  getErrorTitle(): string {
    if (this.error().isNetworkError) return 'Network Error';
    if (this.error().isServerError) return 'Server Error';
    if (this.error().status === 401) return 'Unauthorized';
    if (this.error().status === 403) return 'Forbidden';
    if (this.error().status === 404) return 'Not Found';
    if (this.error().status === 400) return 'Invalid Request';
    return 'Error';
  }

  getErrorDetails(): string {
    const apiError = this.error().originalError;
    return JSON.stringify(
      {
        status: this.error().status,
        statusText: this.error().statusText,
        code: this.error().backendError?.code,
        url: apiError instanceof Error && 'url' in apiError ? apiError.url : undefined,
      },
      null,
      2,
    );
  }
}
