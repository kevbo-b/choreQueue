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
