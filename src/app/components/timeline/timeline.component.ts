import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { round } from 'lodash';
import { DueTasksSortMode, IOptions, MoonMode } from 'src/app/models/options';
import { ICategory, IDay, ITask, IntervalMethod } from 'src/app/models/task';
import {
  convertDateToString,
  getDisplayDueDate,
} from 'src/app/models/task-helper-funcions';
import { SaveService } from 'src/app/services/save.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  private _tasks: ITask[] = [];
  public categories: ICategory[] = [];

  public showSkipDialog = false;
  public skipDialogTask: ITask | undefined;
  public daysToSkip: number = 1;
  public newDueDateOnSkip: Date = new Date();

  public todaysDate: Date = new Date();

  private _options: IOptions | undefined;

  private _dueSortMode = DueTasksSortMode;

  public dueTasks: ITask[] = [];
  public futureDays: IDay[] = [];

  public isFrozen = false;

  public constructor(
    public readonly saveService: SaveService,
    public readonly settingsService: SettingsService,
    public readonly router: Router
  ) {}

  ngOnInit(): void {
    this._options = this.settingsService.getOptions();
    this.buildTimelineData();
    this.saveService.getOnChangeSubject().subscribe((tasks) => {
      this.buildTimelineData(tasks);
    });
  }

  openSkipTaskPopup(task: ITask) {
    this.showSkipDialog = true;
    this.skipDialogTask = task;
    if (task.interval.method == IntervalMethod.Day) {
      this.daysToSkip = task.interval.num;
    } else {
      this.daysToSkip = 1;
    }
    //TODO: Support other methods of skipping in the UI (Months, years, regular interval...)
    // this.saveService.completeTask(task, false);
    this.calcNewDueDateForSkip(this.daysToSkip);
  }

  calcNewDueDateForSkip(daysToSkip: number) {
    if (
      this.skipDialogTask &&
      getDisplayDueDate(this.skipDialogTask) &&
      _.isNumber(daysToSkip)
    ) {
      this.newDueDateOnSkip = new Date(getDisplayDueDate(this.skipDialogTask));
      this.newDueDateOnSkip.setDate(
        this.newDueDateOnSkip.getDate() + daysToSkip
      );
    }
  }

  public skipTask(task: ITask): void {
    if (task && _.isNumber(this.daysToSkip)) {
      this.saveService.skipTask(task, IntervalMethod.Day, this.daysToSkip);
    }
    this.showSkipDialog = false;
    this.buildTimelineData();
  }

  completeTask(task: ITask) {
    this.saveService.completeTask(task);
    this.buildTimelineData();
  }

  deleteTask(task: ITask) {
    this.saveService.deleteTask(task);
    this.buildTimelineData();
  }

  public isDue(dateStr: string): boolean {
    var inputDate = new Date(dateStr);
    var todaysDate = new Date();
    if (inputDate.setHours(0, 0, 0, 0) <= todaysDate.setHours(0, 0, 0, 0)) {
      return true;
    }
    return false;
  }

  public selectValue(mouseEvent: MouseEvent): void {
    if (mouseEvent.target && (mouseEvent.target as HTMLInputElement).select) {
      (mouseEvent.target as HTMLInputElement).select();
    }
  }

  private buildTimelineData(tasks?: ITask[]) {
    if (tasks) {
      this._tasks = tasks;
    } else {
      this._tasks = this.saveService.getAllTasks();
      this.categories = this.saveService.getAllCategories();
    }
    //divide: get due tasks and not due tasks
    this.dueTasks = _.cloneDeep(this.getDueTasks(this._tasks));
    this.futureDays = _.cloneDeep(this.getFutureDays(this._tasks));
    //sort them
    this.sortData();
    //also get freeze state
    this.isFrozen = this.saveService.getFreezeState();
  }

  private getDueTasks(tasks: ITask[]): ITask[] {
    let dueTasks: ITask[] = [];
    for (let task of tasks) {
      if (this.isDue(getDisplayDueDate(task))) {
        dueTasks.push(task);
      }
    }
    return dueTasks;
  }

  private getFutureDays(allTasks: ITask[]): IDay[] {
    let futureTasks: ITask[] = [];
    for (let task of allTasks) {
      if (!this.isDue(getDisplayDueDate(task))) {
        futureTasks.push(task);
      }
    }

    let days: IDay[] = [];

    //Group Tasks by Day
    for (let task of futureTasks) {
      let addNew = true;
      for (let day of days) {
        //Add Task to existing day
        if (day.date === getDisplayDueDate(task)) {
          day.tasks.push(task);
          addNew = false;
          break;
        }
      }
      //Add new Day
      if (addNew) {
        days.push({
          date: getDisplayDueDate(task),
          tasks: [task],
        });
      }
    }

    //Add fill dates (if the setting is enabled)
    if (this._options) {
      if (this._options.showAllDays) {
        days = this.addDaysInBetween(days);
      }
    }

    return days;
  }

  private sortData(): void {
    //Sort Future Days
    this.futureDays.sort((a: IDay, b: IDay) => {
      return Date.parse(a.date) - Date.parse(b.date);
    });

    //Sort Tasks within days (due Tasks and open tasks)
    if (this._options?.dueTasksSortMode == this._dueSortMode.Category) {
      this.dueTasks = this.sortTasksByCategory(this.dueTasks);
    } else {
      //sorts by due duration
      this.dueTasks.sort((a: ITask, b: ITask) => {
        return (
          Date.parse(getDisplayDueDate(a)) - Date.parse(getDisplayDueDate(b))
        );
      });
    }
    for (let futureDay of this.futureDays) {
      futureDay.tasks = this.sortTasksByCategory(futureDay.tasks);
    }
  }

  private sortTasksByCategory(tasks: ITask[]): ITask[] {
    tasks.sort((a: ITask, b: ITask) => {
      let priorityA = this.saveService.getCategoryById(a.categoryId)
        ?.priorityPlace as number;
      let priorityB = this.saveService.getCategoryById(b.categoryId)
        ?.priorityPlace as number;

      if (priorityA > priorityB) {
        return 1;
      } else {
        return -1;
      }
    });
    return tasks;
  }

  private addDaysInBetween(days: IDay[]): IDay[] {
    let today = new Date();
    const dayAmountToShow = 100;

    for (let i = 0; i < dayAmountToShow; i++) {
      var dayDate = new Date();
      dayDate.setDate(today.getDate() + i);
      var dayDateStr = convertDateToString(dayDate);
      let dayExists = false;
      for (let day of days) {
        if (day.date == dayDateStr) {
          dayExists = true;
          break;
        }
      }
      if (!dayExists) {
        //add day (empty day)
        days.push({
          date: dayDateStr,
          tasks: [],
        });
      }
    }

    return days;
  }

  public daysTillDue(date: string): number {
    let today = new Date();
    let dateOfDay = new Date(date);

    var diff = Math.abs(today.getTime() - dateOfDay.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    return diffDays;
  }

  public daysTillDueStr(date: string): string {
    let days = this.daysTillDue(date);
    if (days == 1) {
      return `1 day`;
    } else {
      return `${days} days`;
    }
  }

  public freezeButtonClicked(): void {
    if (this.isFrozen) {
      //unfreeze
      let confirmText = `Should all tasks be unfrozen?`;
      if (confirm(confirmText)) {
        this.saveService.deactivateFreeze();
      }
    } else {
      //freeze
      let confirmText = `Should all tasks be frozen? (The days till a task is due wont change till you unfreeze.)`;
      if (confirm(confirmText)) {
        this.saveService.activateFreeze();
      }
    }
  }

  moonIcons: [
    New: string,
    WaxingCrescent: string,
    QuarterMoon: string,
    WaxingGibbous: string,
    Full: string,
    WaningGibbous: string,
    LastQuarter: string,
    WaningCrescent: string
  ] = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  public getMoonIcon(dateStr: string): string {
    let date = new Date(dateStr);
    return this.moonPhase(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  }

  redirectToEditor(dayPreset: string): void {
    this.router.navigate(['/edit/new'], {
      queryParams: { redirectedFrom: 'home', dayPreset: dayPreset },
    });
  }

  public undoAction(): void {
    this.saveService.undoHistoryAction();
  }

  LUNAR_CYCLE = 29.5305882; // 29.53058770576
  DAYS_PER_YEAR = 365.25;
  DAYS_PER_MONTH = 30.6;

  // Number of days since known new moon on `1900-01-01`.
  DAYS_SINCE_NEW_MOON_1900_01_01 = 694039.09;

  moonPhaseAlt(date: Date = new Date()): string {
    // let year = date.getYear()
    let year: number = date.getFullYear();

    let month: number = date.getMonth() + 1;
    const day: number = date.getDate();
    return this.moonPhase(year, month, day);
  }

  // Ported from `http://www.voidware.com/moon_phase.htm`.
  moonPhase(year: number, month: number, day: number): string {
    if (month < 3) {
      year--;
      month += 12;
    }

    month += 1;

    let totalDaysElapsed: number =
      this.DAYS_PER_YEAR * year +
      this.DAYS_PER_MONTH * month +
      day -
      this.DAYS_SINCE_NEW_MOON_1900_01_01;

    totalDaysElapsed /= this.LUNAR_CYCLE; // Divide by the lunar cycle.

    let phase: number = Math.trunc(totalDaysElapsed);

    /*
      Subtract integer part to leave fractional part of original
      `totalDaysElapsed`.
    */
    totalDaysElapsed -= phase;

    // Scale fraction from `0-8`.
    phase = round(totalDaysElapsed * 8);
    if (phase > this.moonIcons.length || phase < 0) {
      return '';
    }

    if (phase >= 8) phase = 0; // `0` and `8` are the same so turn `8` into `0`.

    //return correct string based on setting
    if (this._options) {
      if (this._options.showMoons == MoonMode.All) {
        return this.moonIcons[phase];
      } else if (this._options.showMoons == MoonMode.FullMoonOnly) {
        if (phase == 4) {
          return this.moonIcons[phase];
        } else {
          return '';
        }
      } else if (this._options.showMoons == MoonMode.None) {
        return '';
      }
    }
    return this.moonIcons[phase];
  }
}

export interface IResult {
  name: string;
  phase: string;
  icon: string;
}
