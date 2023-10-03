import { ICategory, ILevelProgress, ITask } from './task';

export interface IOptions {
  showMoons: MoonMode;
  theme: Theme;
  showAllDays: boolean;
  background?: string;
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

export interface IConfigDataTransfer {
  tasks: ITask[];
  categories: ICategory[];
  miniTasks: ITask[];
  level: ILevelProgress;
  settings: IOptions;
}
