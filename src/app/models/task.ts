export interface ITask {
  id: string;
  title: string;
  description: string;
  nextDueDate: string;
  intervalInDays: number;
  xp: number;
}

export interface IDay {
  date: string;
  tasks: ITask[];
}
