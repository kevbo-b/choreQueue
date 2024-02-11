import { convertDateToString } from './task-helper-functions';
import { IntervalMethod } from './task-interfaces';

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
  freezeDate?: string;
}

export class Task {
  public id: string = '';
  public title: string = '';
  public description: string = '';
  public interval: {
    method: IntervalMethod;
    num: number;
  } = {
    method: IntervalMethod.Day,
    num: 7,
  };
  public addToLastDueDate: boolean = false;
  public xp: number = 100;
  public categoryId: string = 'default';
  public timesSkipped: number = 0;
  public hidden: boolean = false;
  public freezeDate?: string;

  private nextDueDate: string = '';

  constructor() {}

  //returns the display-date that should be used in the UI, not the actual data.
  //Based upon freeze State
  public getDisplayDueDate(): string {
    if (this.freezeDate) {
      const diff = this._getDateDifference(
        this.freezeDate,
        convertDateToString(new Date())
      );
      return this.getNextDueDate(IntervalMethod.Day, diff, true);
    } else {
      return this.nextDueDate;
    }
  }

  //Skips to the next due date.
  public getNextDueDate(
    intervalMethod: IntervalMethod = this.interval.method,
    offset: number = this.interval.num,
    useLastDueDateAsBase = this.addToLastDueDate //If false, uses today as base to increment. If true, uses last due date as base to increment from
  ): string {
    var baseDate = new Date(); //begin today
    if (this.addToLastDueDate || useLastDueDateAsBase) {
      baseDate = new Date(this.nextDueDate); //begin on last supposed due Date
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

  //Skips to the next due date and saves it.
  public setNextDueDate(
    intervalMethod: IntervalMethod = this.interval.method,
    offset: number = this.interval.num,
    useLastDueDateAsBase = this.addToLastDueDate //If false, uses today as base to increment. If true, uses last due date as base to increment from
  ): string {
    this.nextDueDate = this.getNextDueDate(
      intervalMethod,
      offset,
      useLastDueDateAsBase
    );
    return this.nextDueDate;
  }

  //Sets the direct value of a parameter to the next due Date (experimental)
  public setNextDueDateValue(dateStr: string): void {
    this.nextDueDate = dateStr;
  }

  //Save the current day as freeze day (for reference. Used for calculations inside getDisplayDueDate())
  public activateFreeze(): void {
    if (this.addToLastDueDate) {
      //... disregard?
    } else {
      const today = convertDateToString(new Date());
      this.freezeDate = today;
    }
  }

  //Make the display date be the actual nextDueDate
  public deactivateFreeze(): void {
    if (this.addToLastDueDate) {
      //... disregard?
    } else if (this.freezeDate) {
      this.nextDueDate = this.getDisplayDueDate();
      delete this.freezeDate;
    }
  }

  private _getDateDifference(fromDateStr: string, toDateStr: string): number {
    let fromDate = new Date(fromDateStr);
    let toDate = new Date(toDateStr);

    var diff = Math.abs(fromDate.getTime() - toDate.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    return diffDays;
  }
}
