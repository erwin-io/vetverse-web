import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { menu } from 'src/app/core/model/menu';
import { NavItem } from 'src/app/core/model/nav-item';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { AlertDialogModel } from 'src/app/shared/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnDestroy {
  opened: boolean = true;
  mediaWatcher: Subscription;
  menu: NavItem[] = [];

  constructor(
    private media: MediaObserver,
    private authService: AuthService,
    private dialog: MatDialog,
    public router: Router,
    private storageService: StorageService
  ) {
    this.initMenu();
    this.mediaWatcher = this.media.asObservable().subscribe((change) => {
      change.forEach(() => {
        this.handleMediaChange();
      });
    });
    this.authService.redirectUrl = this.router.url;
    console.log(this.router.url);
  }

  initMenu() {
    const user = this.storageService.getLoginUser();
    if (!user || !user.role) {
      this.authService.logout();
      this.storageService.saveAccessToken(null);
      this.storageService.saveRefreshToken(null);
      this.storageService.saveLoginUser(null);
      this.router.navigate(['auth/login'], { replaceUrl: true });
    }
    const access = user.role.access;
    const pageAccess =
      access !== null && access !== undefined && access !== ''
        ? access.split(',')
        : [];
    this.menu = [
      {
        displayName: 'Edit Profile',
        iconName: 'edit',
        route: 'profile/edit-profile',
        isParent: false,
      },
      {
        displayName: 'Password & Security',
        iconName: 'verified_user',
        route: 'profile/password-and-security',
        isParent: false,
      },{
        displayName: 'Back to Dashboard',
        iconName: 'keyboard_backspace',
        route: 'dashboard',
        isParent: false,
      }
    ];
  }

  private handleMediaChange() {
    if (this.media.isActive('lt-md')) {
      this.opened = false;
    } else {
      this.opened = true;
    }
  }

  handleSignOut() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Are you sure you want to logout?';
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color: 'primary',
    };
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel',
    };
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      maxWidth: '400px',
      closeOnNavigation: true,
    });

    dialogRef.componentInstance.alertDialogConfig = dialogData;
    dialogRef.componentInstance.conFirm.subscribe((data: any) => {
      this.authService.redirectUrl = this.router.url;
      console.log(this.router.url);
      console.log(this.authService.redirectUrl);
      this.authService.logout();
      this.storageService.saveAccessToken(null);
      this.storageService.saveRefreshToken(null);
      this.storageService.saveLoginUser(null);
      this.router.navigate(['auth/login'], { replaceUrl: true });
      dialogRef.close();
    });
    // dialogRef.afterClosed().subscribe(dialogResult => {
    //   if (dialogResult) {
    //     }
    // });
  }
  ngOnDestroy() {
    this.mediaWatcher.unsubscribe();
  }
}
