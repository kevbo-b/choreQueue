import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import {
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
  options: IOptions | undefined;

  public moonModes = MoonMode;
  public themes = Theme;
  public dueSortMode = DueTasksSortMode;

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

  public async exportData() {
    //all data
    let dataExport: IConfigDataTransfer = {
      tasks: this.saveService.getAllTasks(),
      categories: this.saveService.getAllCategories(),
      miniTasks: this.saveService.getAllMiniTasks(),
      level: this.saveService.getLevelProgress(),
      settings: this.settingsService.getOptions(),
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

  public importClicked(): void {
    this.fileImportElement.nativeElement.click();
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
