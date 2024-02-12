import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import {
  BackgroundSettings,
  DueTasksSortMode,
  IConfigDataTransfer,
  IOptions,
  MoonMode,
  Theme,
} from '../models/options';
import { SaveService } from '../services/save.service';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

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

  @ViewChild('fileImportElement') fileImportElement!: ElementRef;
  @ViewChild('imageImportElement') imageImportElement!: ElementRef;
  options: IOptions = {
    showAllDays: false,
    showMoons: MoonMode.FullMoonOnly,
    theme: Theme.Light,
    dueTasksSortMode: DueTasksSortMode.Category,
    backgroundSettings: BackgroundSettings.Fixed,
  };

  public moonModes = MoonMode;
  public themes = Theme;
  public dueSortMode = DueTasksSortMode;
  public backgroundSettings = BackgroundSettings;
  public backgroundImgPreview = '';

  ngOnInit(): void {
    this.options = this.settingsService.getOptions();
    let bgImage = this.settingsService.getBgImage();
    if (bgImage) {
      this.backgroundImgPreview = bgImage;
    }
    this.settingsService.getOnOptionsChangeSubject().subscribe((newOptions) => {
      this.options = newOptions;
    });
  }

  public onSavePressed(): void {
    if (this.options) {
      this.settingsService.setOptions(this.options);
      this.settingsService.saveBgImage(this.backgroundImgPreview);
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
      this.backgroundImgPreview = '';
    }
  }

  public async exportData() {
    //all data
    let dataExport: IConfigDataTransfer = {
      tasks: this.saveService.getAllTasks(),
      categories: this.saveService.getAllCategories(),
      miniTasks: this.saveService.getAllMiniTasks(),
      level: this.saveService.getLevelProgress(),
      settings: this.settingsService.getOptions(),
      history: this.saveService.getHistory(),
    };
    let dateStr =
      new Date().toDateString() +
      ' ' +
      new Date().getHours() +
      '-' +
      new Date().getMinutes();
    let platform = Capacitor.getPlatform();
    let filename = `Task queue ${platform} - ${dateStr}.json`;
    //platform wise distinction
    if (platform == 'web') {
      //Browser
      var element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/json;charset=UTF-8,' +
          encodeURIComponent(JSON.stringify(dataExport))
      );
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click(); // simulate click
      document.body.removeChild(element);
    } else if (platform == 'android') {
      //Native Android
      await Filesystem.writeFile({
        path: filename,
        data: JSON.stringify(dataExport),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      }).finally(() => {
        alert(`File Exported Successfully! (Saved in "Documents" Folder)`);
      });
    }
  }

  public importApplicationData(event: any) {
    if (event.target.files.length !== 1) {
      alert('No file selected');
    } else {
      const reader = new FileReader();
      let data: IConfigDataTransfer | undefined = undefined;
      reader.onloadend = (e) => {
        // handle data processing
        try {
          let importedData = JSON.parse(
            reader.result as string
          ) as IConfigDataTransfer;
          if (this._isInstanceOfData(importedData)) {
            data = importedData;
          }
        } catch (err) {}
        if (data) {
          this.saveService.importData(data);
          this.settingsService.importData(data);
          alert('Data imported successfully!');
        } else {
          alert('Error! The File could not be imported.');
        }
      };
      reader.readAsText(event.target.files[0]);
    }
  }

  public importBackground(event: any): void {
    let message = '';
    let progress = 0;
    let currentFile = 0;
    let selectedFiles = event.target.files;

    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);

      if (file) {
        this.backgroundImgPreview = '';
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            this.backgroundImgPreview = e.target.result;
          } catch (err) {
            alert('Error! Could not load image file.');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public clearBgImage(): void {
    this.backgroundImgPreview = '';
  }

  public importDataClicked(): void {
    this.fileImportElement.nativeElement.click();
  }

  public importBackgroundClicked(): void {
    this.imageImportElement.nativeElement.click();
  }

  private _isInstanceOfData(object: any): object is IConfigDataTransfer {
    return (
      object &&
      object.tasks &&
      object.categories &&
      object.level &&
      object.settings &&
      object.miniTasks
    );
  }
}
