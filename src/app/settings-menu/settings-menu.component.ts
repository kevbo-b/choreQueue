import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { IOptions, MoonMode, Theme } from '../models/options';
import { SaveService } from '../services/save.service';

@Component({
  selector: 'app-settings-menu',
  templateUrl: './settings-menu.component.html',
  styleUrls: ['./settings-menu.component.scss'],
})
export class SettingsMenuComponent implements OnInit {
  public constructor(
    public readonly settingsService: SettingsService,
    public readonly saveService: SaveService
  ) {}

  options: IOptions | undefined;

  public moonModes = MoonMode;
  public themes = Theme;

  ngOnInit(): void {
    this.options = this.settingsService.getOptions();
    this.settingsService.getOnOptionsChangeSubject().subscribe((newOptions) => {
      this.options = newOptions;
    });
  }

  public onSavePressed(): void {
    if (this.options) {
      this.settingsService.setOptions(this.options);
    }
  }

  public onClearData(): void {
    if (
      confirm(
        `Do you really want to DELETE ALL DATA, including all Tasks, Settings and other configurations? (This action cannot be undone!)`
      )
    ) {
      this.settingsService.resetData();
      this.saveService.resetData();
    }
  }
}
