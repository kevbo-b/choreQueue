import { Task } from './task-class';

export function convertDateToString(date: Date): string {
  var getYear = date.toLocaleString('default', { year: 'numeric' });
  var getMonth = date.toLocaleString('default', { month: '2-digit' });
  var getDay = date.toLocaleString('default', { day: '2-digit' });

  return getYear + '-' + getMonth + '-' + getDay;
}

export function getTaskById(id: string, allTasks: Task[]): Task | undefined {
  for (let task of allTasks) {
    if (id == task.id) {
      return task;
    }
  }
  return undefined;
}
