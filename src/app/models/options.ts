import { Task } from './task-class';
import { ICategory, IHistoryEntry, ILevelProgress } from './task-interfaces';

export interface IOptions {
  showMoons: MoonMode;
  theme: Theme;
  showAllDays: boolean;
  dueTasksSortMode: DueTasksSortMode;
  backgroundSettings: BackgroundSettings;
}

export enum MoonMode {
  None,
  FullMoonOnly,
  All,
}

export enum Theme {
  Light,
  Dark,
}

export enum DueTasksSortMode {
  Category,
  DueDuration,
}

export enum BackgroundSettings {
  Fixed,
  Stretched,
}

export interface IConfigDataTransfer {
  tasks: Task[];
  categories: ICategory[];
  miniTasks: Task[];
  level: ILevelProgress;
  settings: IOptions;
  history: IHistoryEntry[];
}
