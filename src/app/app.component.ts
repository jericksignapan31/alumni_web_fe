// angular import
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent implements OnInit {
  // public props
  title = 'mantis-free-version';

  private authService = inject(AuthService);

  ngOnInit(): void {
    // Initialize auth state on app load
    this.authService.initializeAuth();
  }
}
