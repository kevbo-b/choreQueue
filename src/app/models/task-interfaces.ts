import { Task } from './task-class';

export interface ICategory {
  id: string;
  name: string;
  color: string;
  priorityPlace: number;
  hidden: boolean;
}

export enum IntervalMethod {
  Day,
  Month,
  Year,
  NeverRepeat,
}

export interface IDay {
  date: string;
  tasks: Task[];
}

export interface ILevelProgress {
  level: number;
  xp: number;
}

export interface IXpChangeMessage {
  progressPercentage: number;
  isNewLevel: boolean;
}

export interface IHistoryEntry {
  taskId: string;
  date: string;
  action: ITimelineAction;
  objectBeforeAction?: Task;
  xpGain?: number;
}

export enum ITimelineAction {
  Complete,
  Delete,
  Move,
  DeleteAndComplete,
}

export interface IDeletedTaskName {
  id: string;
  name: string;
}
