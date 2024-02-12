import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { BackgroundSettings } from '../models/options';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public constructor(
    public readonly router: Router,
    public readonly settingsService: SettingsService
  ) {
    this.backgroundImg = this.settingsService.getBgImage();
    this.backgroundSetting = this.settingsService.getOptions()
      .backgroundSettings as BackgroundSettings;
  }

  public backgroundImg = '';
  public backgroundSetting?: BackgroundSettings;
  public showMiniTaskPopup = false;

  public redirectToEditor(): void {
    this.router.navigate(['/edit/new'], {
      queryParams: { redirectedFrom: 'home' },
    });
  }

  public popupMiniTasks(): void {
    this.showMiniTaskPopup = true;
  }

  public onMiniTasksSelected(): void {
    this.showMiniTaskPopup = false;
  }

  public getDivClass(): string {
    if (!this.backgroundImg || this.backgroundSetting === undefined) {
      this.backgroundImg = '';
      return 'divNoBgImage';
    }
    if (this.backgroundSetting == BackgroundSettings.Fixed) {
      return '';
    } else if (this.backgroundSetting == BackgroundSettings.Stretched) {
      return 'divWithStretchedBgImage';
    }
    return 'divNoBgImage';
  }

  public getImgClass(): string {
    if (!this.backgroundImg || this.backgroundSetting === undefined) {
      return '';
    }
    if (this.backgroundSetting == BackgroundSettings.Fixed) {
      return 'imgFixed';
    } else if (this.backgroundSetting == BackgroundSettings.Stretched) {
      return 'imgStretched';
    }
    return '';
  }
}
