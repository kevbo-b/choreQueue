import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IOptions, MoonMode, Theme } from '../models/options';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {}

  private options: IOptions = {
    showAllDays: false,
    showMoons: MoonMode.FullMoonOnly,
    theme: Theme.Light,
  };
  private optionsKey = 'optionsKey';
  private onOptionsUpdateSubject = new Subject<IOptions>();

  public getOptions(): IOptions {
    this._getData();
    return this.options;
  }

  public setOptions(newOptions: IOptions): void {
    this.options = newOptions;
    this._setData();
    this.onOptionsUpdateSubject.next(this.options);
  }

  private _getData(): void {
    let options = JSON.parse(
      localStorage.getItem(this.optionsKey) as string
    ) as unknown as IOptions;
    if (options) {
      this.options = options;
    }
  }

  private _setData(): void {
    localStorage.setItem(this.optionsKey, JSON.stringify(this.options));
  }

  public getOnOptionsChangeSubject(): Subject<IOptions> {
    return this.onOptionsUpdateSubject;
  }
}
