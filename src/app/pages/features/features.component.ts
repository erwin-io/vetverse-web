import { Component, OnDestroy } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { StorageService } from 'src/app/core/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertDialogComponent } from '../../../app/shared/alert-dialog/alert-dialog.component';
import { AlertDialogModel } from '../../../app/shared/alert-dialog/alert-dialog-model';
import { NavItem } from 'src/app/core/model/nav-item';
import { menu } from 'src/app/core/model/menu';
import { LoginResult } from 'src/app/core/model/loginresult.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
})
export class FeaturesComponent implements OnDestroy {
  currentUser: LoginResult = {} as LoginResult;
  opened: boolean = true;
  mediaWatcher: Subscription;
  menu: NavItem[] = [];
  defaultMenuItem = {
    displayName: 'Dashboard',
    iconName: 'dashboard',
    route: 'dashboard',
  } as NavItem;
  signOutMenuItem = {
    displayName: 'Sign Out',
    iconName: 'exit_to_app',
  } as NavItem;

  constructor(
    private media: MediaObserver,
    private authService: AuthService,
    private dialog: MatDialog,
    public router: Router,
    private storageService: StorageService
  ) {
    this.currentUser = this.storageService.getLoginUser();
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
    this.currentUser = this.storageService.getLoginUser();
    if (!this.currentUser || !this.currentUser.role) {
      this.authService.logout();
      this.storageService.saveAccessToken(null);
      this.storageService.saveRefreshToken(null);
      this.storageService.saveLoginUser(null);
      this.router.navigate(['auth/login'], { replaceUrl: true });
    }
    const access = this.currentUser.role.access;
    const pageAccess =
      access !== null && access !== undefined && access !== ''
        ? access.split(',')
        : [];
    menu.forEach((element: NavItem) => {
      if (element.isParent && element.children.length > 0) {
        const childPages = [];
        element.children.forEach((c) => {
          if (pageAccess.some((a) => a === c.displayName)) {
            childPages.push(c);
          }
        });
        if (childPages.length > 0) {
          const { displayName, disabled, iconName, isParent, route } = element;
          this.menu.push({
            displayName,
            disabled,
            iconName,
            route,
            children: childPages,
            isParent,
          });
        }
      } else if (
        pageAccess.some((x) => !element.isParent && x === element.displayName)
      ) {
        this.menu.push(element);
      }
    });
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

  profilePicErrorHandler(event) {
    event.target.src = '../../../assets/img/vector/profile-not-found.png';
  }
}
