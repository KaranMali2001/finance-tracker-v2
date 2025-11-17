import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClerkService } from 'ngx-clerk';
import { firstValueFrom } from 'rxjs';
import { configureApiWithClerk } from './config/api.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App implements OnInit {
  constructor(private _clerk: ClerkService) {
    this._clerk.__init({
      publishableKey: 'pk_test_cmVhZHktbGFyay04MS5jbGVyay5hY2NvdW50cy5kZXYk',
    });
  }

  ngOnInit(): void {
    // Configure API with Clerk authentication token
    // This uses the existing configureApiWithClerk function which handles
    // base URL, environment config, and other API settings
    configureApiWithClerk(async () => {
      try {
        // Get the current session from the observable
        const session = await firstValueFrom(this._clerk.session$);

        // Get the token from the session (getToken() returns a Promise<string>)
        if (session) {
          const token = await session.getToken();

          return token || null;
        }

        return null;
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
        return null;
      }
    });
  }

  protected readonly title = signal('finance-tracker-web');
}
