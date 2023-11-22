import { ICategory, ILevelProgress, ITask } from './task';

export interface IOptions {
  showMoons: MoonMode;
  theme: Theme;
  showAllDays: boolean;
  background?: string;
  dueTasksSortMode: DueTasksSortMode;
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

export interface IConfigDataTransfer {
  tasks: ITask[];
  categories: ICategory[];
  miniTasks: ITask[];
  level: ILevelProgress;
  settings: IOptions;
}
