import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      console.log('[AuthGuard] Access granted to:', state.url);
      return true;
    }

    // Not authenticated - redirect to login
    console.log('[AuthGuard] Access denied. Redirecting to login from:', state.url);
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
      replaceUrl: true
    });
    return false;
  }
}
