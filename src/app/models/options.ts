import { Task } from './task-class';
import { ICategory, ILevelProgress } from './task-interfaces';

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
  tasks: Task[];
  categories: ICategory[];
  miniTasks: Task[];
  level: ILevelProgress;
  settings: IOptions;
}
