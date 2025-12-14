import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-profile-view',
  imports: [CommonModule],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  private authService = inject(AuthService);

  currentUser: any;

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    } else {
      try {
        const raw = localStorage.getItem('current_user');
        this.currentUser = raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.error('Failed to load current user', err);
        this.currentUser = null;
      }
    }
  }

  getFullName(): string {
    if (!this.currentUser) {
      return 'Unknown User';
    }
    const parts = [this.currentUser.first_name, this.currentUser.middle_name, this.currentUser.last_name];
    return (
      parts
        .filter((part) => !!part && String(part).trim().length)
        .map((part) => String(part).trim())
        .join(' ')
        .trim() || 'Unknown User'
    );
  }

  getInitials(): string {
    const name = this.getFullName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
}
