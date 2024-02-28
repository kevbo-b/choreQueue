import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { round } from 'lodash';
import { DueTasksSortMode, IOptions, MoonMode } from 'src/app/models/options';
import { Task } from 'src/app/models/task-class';
import { convertDateToString } from 'src/app/models/task-helper-functions';
import {
  ICategory,
  IDay,
  IntervalMethod,
} from 'src/app/models/task-interfaces';
import { SaveService } from 'src/app/services/save.service';
import { SettingsService } from 'src/app/services/settings.service';
import { getMoonIcon, moonPhaseAlt } from './moon-helper';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  private _tasks: Task[] = [];
  public categories: ICategory[] = [];

  public showSkipDialog = false;
  public skipDialogTask: Task | undefined;
  public daysToSkip: number = 1;
  public newDueDateOnSkip: Date = new Date();
  public daysToSkipOffset: number = 0;

  public todaysDate: Date = new Date();

  protected _options: IOptions | undefined;

  private _dueSortMode = DueTasksSortMode;

  public dueTasks: Task[] = [];
  public futureDays: IDay[] = [];

  protected moonPhaseAlt = moonPhaseAlt;
  protected getMoonIcon = getMoonIcon;

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

  openSkipTaskPopup(task: Task) {
    this.showSkipDialog = true;
    this.skipDialogTask = task;
    if (task.interval.method == IntervalMethod.Day) {
      this.daysToSkip = task.interval.num;
    } else {
      this.daysToSkip = 1;
    }
    //calculate diff to today
    let daysDifference =
      (Date.parse(task.getDisplayDueDate()) -
        Date.parse(convertDateToString(new Date()))) /
      (60 * 60 * 24 * 1000);
    //Create offset so dueDate entries don't start at day -5 or something when skipping. Results in Better UI
    this.daysToSkipOffset = Math.min(daysDifference, 0) * -1;
    //TODO: Support other methods of skipping in the UI (Months, years, regular interval...)
    this.calcNewDueDateForSkip(this.daysToSkip);
  }

  calcNewDueDateForSkip(daysToSkip: number) {
    if (
      this.skipDialogTask &&
      this.skipDialogTask.getDisplayDueDate() &&
      _.isNumber(daysToSkip)
    ) {
      this.newDueDateOnSkip = new Date(this.skipDialogTask.getDisplayDueDate());

      this.newDueDateOnSkip.setDate(
        this.newDueDateOnSkip.getDate() + daysToSkip + this.daysToSkipOffset
      );
    }
  }

  public skipTask(task: Task): void {
    if (task && _.isNumber(this.daysToSkip) && this.daysToSkip !== 0) {
      this.saveService.skipTask(
        task,
        IntervalMethod.Day,
        this.daysToSkip + this.daysToSkipOffset
      );
    }
    this.showSkipDialog = false;
    this.buildTimelineData();
  }

  completeTask(task: Task) {
    this.saveService.completeTask(task);
    this.buildTimelineData();
  }

  deleteTask(task: Task) {
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

  private buildTimelineData(tasks?: Task[]) {
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
  }

  private getDueTasks(tasks: Task[]): Task[] {
    let dueTasks: Task[] = [];
    for (let task of tasks) {
      if (this.isDue(task.getDisplayDueDate())) {
        dueTasks.push(task);
      }
    }
    return dueTasks;
  }

  private getFutureDays(allTasks: Task[]): IDay[] {
    let futureTasks: Task[] = [];
    for (let task of allTasks) {
      if (!this.isDue(task.getDisplayDueDate())) {
        futureTasks.push(task);
      }
    }

    let days: IDay[] = [];

    //Group Tasks by Day
    for (let task of futureTasks) {
      let addNew = true;
      for (let day of days) {
        //Add Task to existing day
        if (day.date === task.getDisplayDueDate()) {
          day.tasks.push(task);
          addNew = false;
          break;
        }
      }
      //Add new Day
      if (addNew) {
        days.push({
          date: task.getDisplayDueDate(),
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
      this.dueTasks.sort((a: Task, b: Task) => {
        return (
          Date.parse(a.getDisplayDueDate()) - Date.parse(b.getDisplayDueDate())
        );
      });
    }
    for (let futureDay of this.futureDays) {
      futureDay.tasks = this.sortTasksByCategory(futureDay.tasks);
    }
  }

  private sortTasksByCategory(tasks: Task[]): Task[] {
    tasks.sort((a: Task, b: Task) => {
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

    for (let i = 1; i < dayAmountToShow; i++) {
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
    today.setHours(0, 0, 0, 0);
    let dateOfDay = new Date(date);

    var diff = Math.abs(today.getTime() - dateOfDay.getTime());
    var diffDays = Math.round(diff / (1000 * 3600 * 24));

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

  public freezeAll(): void {
    //freeze
    let confirmText = `Should all tasks be frozen?`;
    if (confirm(confirmText)) {
      this.saveService.freezeAllTasks();
    }
  }

  public unfreezeAll(): void {
    //unfreeze
    let confirmText = `Should all tasks be unfrozen?`;
    if (confirm(confirmText)) {
      this.saveService.unfreezeAlTasks();
    }
  }

  redirectToEditor(dayPreset: string): void {
    this.router.navigate(['/edit/new'], {
      queryParams: { redirectedFrom: 'home', dayPreset: dayPreset },
    });
  }

  public undoAction(): void {
    this.saveService.undoHistoryAction();
  }
}
