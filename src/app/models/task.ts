export interface ITask {
  id: string;
  title: string;
  description: string;
  nextDueDate: string;
  interval: {
    method: IntervalMethod;
    num: number;
  };
  addToLastDueDate: boolean;
  xp: number;
  categoryId: string;
  timesSkipped: number;
  hidden: boolean;
}

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
  tasks: ITask[];
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
  objectBeforeAction?: ITask;
  xpGain?: number;
}

export enum ITimelineAction {
  Complete,
  Delete,
  Move,
}
