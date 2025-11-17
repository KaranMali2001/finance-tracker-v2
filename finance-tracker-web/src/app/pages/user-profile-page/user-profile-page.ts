import { Component, OnInit } from '@angular/core';
import { ClerkUserProfileComponent } from 'ngx-clerk';
import { from } from 'rxjs';
import { AuthService } from '../../../api';

@Component({
  selector: 'app-user-profile-page',
  imports: [ClerkUserProfileComponent],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss',
})
export class UserProfilePageComponent implements OnInit {
  ngOnInit(): void {
    from(AuthService.getApiV1AuthUser()).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
