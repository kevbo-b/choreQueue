import { ITask, IntervalMethod } from './task';

//returns the display-date that should be used in the UI, not the actual data.
//Based upon freeze State
export function getDisplayDueDate(task: ITask): string {
  if (task.freezeDate) {
    const diff = _getDateDifference(
      task.freezeDate,
      convertDateToString(new Date())
    ); //7
    console.log(
      'yes',
      task.freezeDate,
      diff,
      getNextDueDate(task, IntervalMethod.Day, diff, true)
    );
    return getNextDueDate(task, IntervalMethod.Day, diff, true);
  } else {
    console.log('nope', task.nextDueDate);
    return task.nextDueDate;
  }
}

function _getDateDifference(fromDateStr: string, toDateStr: string): number {
  let fromDate = new Date(fromDateStr);
  let toDate = new Date(toDateStr);

  var diff = Math.abs(fromDate.getTime() - toDate.getTime());
  var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

  return diffDays;
}

export function convertDateToString(date: Date): string {
  var getYear = date.toLocaleString('default', { year: 'numeric' });
  var getMonth = date.toLocaleString('default', { month: '2-digit' });
  var getDay = date.toLocaleString('default', { day: '2-digit' });

  return getYear + '-' + getMonth + '-' + getDay;
}

export function getNextDueDate(
  task: ITask,
  intervalMethod: IntervalMethod,
  offset: number,
  useDueDateAsBase = false //If false, uses today as base to increment. If true, uses last due date as base to increment
): string {
  var baseDate = new Date(); //begin today
  if (task.addToLastDueDate || useDueDateAsBase) {
    baseDate = new Date(task.nextDueDate); //begin on last supposed due Date
  }
  var newDate = new Date(baseDate);
  //Add interval
  if (intervalMethod == IntervalMethod.Day) {
    newDate.setDate(newDate.getDate() + offset);
  } else if (intervalMethod == IntervalMethod.Month) {
    newDate = new Date(newDate.setMonth(newDate.getMonth() + offset));
  } else if (intervalMethod == IntervalMethod.Year) {
    newDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + offset));
  }

  return convertDateToString(newDate);
}
