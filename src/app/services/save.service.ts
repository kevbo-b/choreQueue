import { Injectable, OnInit } from '@angular/core';
import { ILevelProgress, ITask, IntervalMethod } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  constructor() {}

  private allTasks: ITask[] = [];
  private tasksKey = 'choreTasks';

  private levelProgress: ILevelProgress = {
    level: 1,
    xp: 0,
  };
  private levelProgressKey = 'levelProgress';

  private _getData() {
    //tasks
    if (this.allTasks.length == 0) {
      let choreTasksData = JSON.parse(
        localStorage.getItem(this.tasksKey) as string
      ) as unknown as ITask[];
      if (choreTasksData) {
        this.allTasks = choreTasksData;
      }
    }
    //level
    let levelData = JSON.parse(
      localStorage.getItem(this.levelProgressKey) as string
    ) as unknown as ILevelProgress;
    if (levelData) {
      this.levelProgress = levelData;
    }
  }

  private _setData() {
    localStorage.setItem(this.tasksKey, JSON.stringify(this.allTasks));
    localStorage.setItem(
      this.levelProgressKey,
      JSON.stringify(this.levelProgress)
    );
  }

  public getTaskById(id: string): ITask | undefined {
    this._getData();
    for (let task of this.allTasks) {
      if (id == task.id) {
        return task;
      }
    }
    return undefined;
  }

  public addNewTask(task: ITask): void {
    this.allTasks.push(task);
    this._setData();
  }

  public editTask(task: ITask): void {
    let taskToEdit = this.getTaskById(task.id);
    if (taskToEdit) {
      taskToEdit.title = task.title;
      taskToEdit.description = task.description;
      taskToEdit.nextDueDate = task.nextDueDate;
      taskToEdit.interval = task.interval;
      taskToEdit.xp = task.xp;
    }
    this._setData();
  }

  public deleteTask(task: ITask): void {
    let taskToEdit = this.getTaskById(task.id);
    if (taskToEdit) {
      let index = this.allTasks.indexOf(taskToEdit, 0);
      if (index > -1) {
        this.allTasks.splice(index, 1);
      }
    }
    this._setData();
  }

  public getAllTasks(): ITask[] {
    this._getData();
    return this.allTasks;
  }

  public completeTask(inputtedTask: ITask, gainXP: boolean = true): void {
    var task = this.getTaskById(inputtedTask.id);
    if (task) {
      if (gainXP) {
        this.addXP(inputtedTask.xp);
      }
      if (task.interval.method === IntervalMethod.NeverRepeat) {
        this.deleteTask(task);
        return;
      }
      task.nextDueDate = this.setNextDueDate(task);
      this._setData();
    }
  }

  private setNextDueDate(task: ITask): string {
    var baseDate = new Date(); //begin today
    if (task.addToLastDueDate) {
      baseDate = new Date(task.nextDueDate); //begin on last supposed due Date
    }
    var newDate = new Date(baseDate);
    //Add interval
    if (task.interval.method == IntervalMethod.Day) {
      newDate.setDate(newDate.getDate() + task.interval.num);
    } else if (task.interval.method == IntervalMethod.Month) {
      newDate = new Date(
        newDate.setMonth(newDate.getMonth() + task.interval.num)
      );
    } else if (task.interval.method == IntervalMethod.Year) {
      newDate = new Date(
        baseDate.setFullYear(baseDate.getFullYear() + task.interval.num)
      );
    }

    var getYear = newDate.toLocaleString('default', { year: 'numeric' });
    var getMonth = newDate.toLocaleString('default', { month: '2-digit' });
    var getDay = newDate.toLocaleString('default', { day: '2-digit' });

    return getYear + '-' + getMonth + '-' + getDay;
  }

  //leveling
  public getLevelProgress(): ILevelProgress {
    return this.levelProgress;
  }

  levelXP = [];

  /*
   * Adds XP to the Leveling Progress.
   * Levels up if there is enough XP.
   * Returns if Player has leveled up
   */
  public addXP(xp: number): boolean {
    this.levelProgress.xp = this.levelProgress.xp + xp;
    //levelUp
    var isLevelingUp = false;
    var xpNeeded = this.getLevelXP(this.levelProgress.level);
    if (this.levelProgress.xp > xpNeeded) {
      this.levelProgress.level = this.levelProgress.level + 1;
      this.levelProgress.xp = this.levelProgress.xp - xpNeeded;
      isLevelingUp = true;
    }
    this._setData();
    console.log(this.levelProgress, isLevelingUp, xpNeeded);
    return isLevelingUp;
  }

  private getLevelXP(level: number): number {
    const baseLevel = 350;
    const maxForLevel = 1350;
    const linearIncreaseInPercent = 5;
    const roundToNext = 5;

    let currentLevelXp = baseLevel + baseLevel * (5 / 100) * level;
    currentLevelXp = Math.ceil(currentLevelXp / roundToNext) * roundToNext;

    return Math.min(currentLevelXp, maxForLevel);
  }
}
