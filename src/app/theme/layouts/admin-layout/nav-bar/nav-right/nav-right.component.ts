// angular import
import { Component, output, inject, input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertService } from 'src/app/core/services/alert.service';

// third party

// icon
import { IconService } from '@ant-design/icons-angular';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {
  private iconService = inject(IconService);
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);

  // public props
  styleSelectorToggle = input<boolean>();
  readonly Customize = output();
  windowWidth: number;
  screenFull: boolean = true;
  direction: string = 'ltr';
  currentUserName: string = 'User';

  // constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      ...[
        CheckCircleOutline,
        GiftOutline,
        MessageOutline,
        SettingOutline,
        PhoneOutline,
        LogoutOutline,
        EditOutline,
        UserOutline,
        EditOutline,
        ProfileOutline,
        QuestionCircleOutline,
        LockOutline,
        CommentOutline,
        UnorderedListOutline,
        ArrowRightOutline,
        BellOutline,
        GithubOutline,
        WalletOutline
      ]
    );
    this.loadCurrentUserName();
  }

  private loadCurrentUserName(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const firstName = currentUser?.first_name || '';
      const lastName = currentUser?.last_name || '';
      this.currentUserName = `${firstName} ${lastName}`.trim() || 'User';
    } else {
      try {
        const raw = localStorage.getItem('current_user');
        const user = raw ? JSON.parse(raw) : null;
        if (user) {
          const firstName = user?.first_name || '';
          const lastName = user?.last_name || '';
          this.currentUserName = `${firstName} ${lastName}`.trim() || 'User';
        }
      } catch (err) {
        console.error('Failed to load current user name', err);
      }
    }
  }

  profile = [
    {
      icon: 'edit',
      title: 'Edit Profile'
    },
    {
      icon: 'user',
      title: 'View Profile'
    },
    {
      icon: 'profile',
      title: 'Social Profile'
    },
    {
      icon: 'wallet',
      title: 'Billing'
    },
    {
      icon: 'logout',
      title: 'Logout'
    }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Account Settings'
    },
    {
      icon: 'lock',
      title: 'Privacy Center'
    },
    {
      icon: 'comment',
      title: 'Feedback'
    },
    {
      icon: 'unordered-list',
      title: 'History'
    }
  ];

  // Logout function
  logout(): void {
    this.alertService.confirmLogout().then((confirmed) => {
      if (confirmed) {
        this.authService.logout();
        this.alertService.toast('success', 'Logged out successfully!', 2000);
        this.router.navigate(['/login']);
      }
    });
  }

  // Handle profile menu item clicks
  onProfileItemClick(itemTitle: string): void {
    if (itemTitle === 'Logout') {
      this.logout();
    } else if (itemTitle === 'Edit Profile') {
      // Navigate to edit profile page
      this.router.navigate(['/edit-profile']);
    } else if (itemTitle === 'View Profile') {
      // Navigate to view profile page
      this.router.navigate(['/profile']);
    } else if (itemTitle === 'Social Profile') {
      // Navigate to social profile page
      this.router.navigate(['/social-profile']);
    } else if (itemTitle === 'Billing') {
      // Navigate to billing page
      this.router.navigate(['/billing']);
    }
  }
}
