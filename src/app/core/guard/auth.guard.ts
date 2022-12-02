import { StorageService } from 'src/app/core/storage/storage.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private storageService: StorageService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const url: string = state.url;

    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    const user = this.storageService.getLoginUser();
    const refresh_token = this.storageService.getRefreshToken();
    // const token = this.getRefreshToken(user.userId, refresh_token);

    if (!user || !refresh_token || refresh_token === '') {
      this.authService.redirectUrl = url;
      this.handleLogout();
      return false;
    }
    // Store the attempted URL for redirecting
    // Navigate to the login page with extras
    this.authService.refreshToken({userId: user.userId, refresh_token}).pipe(
      tap(token => {
        if(!token) {
          this.handleLogout();
          return false;
        }
        else {
          this.storageService.saveAccessToken(token.accessToken);
          this.storageService.saveRefreshToken(token.refreshToken);
          return true;
        }
      })
    );
    return true;
  }

  handleLogout() {
    this.storageService.saveAccessToken(null);
    this.storageService.saveRefreshToken(null);
    this.storageService.saveLoginUser(null);
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
