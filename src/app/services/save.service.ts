import { Injectable, OnInit } from '@angular/core';
import {
  ICategory,
  ILevelProgress,
  ITask,
  IXpChangeMessage,
  IntervalMethod,
} from '../models/task';
import { Observable, Subject } from 'rxjs';

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

  private categories: ICategory[] = [];
  private defaultCategory: ICategory = {
    id: 'default',
    name: 'Default',
    color: '4444BB',
    priorityPlace: 0,
  };
  private categoriesKey = 'taskCategories';

  private levelSubject = new Subject<IXpChangeMessage>();

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
    //categories
    let categoriesData = JSON.parse(
      localStorage.getItem(this.categoriesKey) as string
    ) as unknown as ICategory[];
    if (categoriesData && categoriesData.length > 0) {
      this.categories = categoriesData;
    } else {
      this.categories = [this.defaultCategory];
    }
  }

  private _setData() {
    localStorage.setItem(this.tasksKey, JSON.stringify(this.allTasks));
    localStorage.setItem(
      this.levelProgressKey,
      JSON.stringify(this.levelProgress)
    );
    localStorage.setItem(this.categoriesKey, JSON.stringify(this.categories));
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
    this._getData();
    return this.levelProgress;
  }

  levelXP = [];

  /*
   * Adds XP to the Leveling Progress.
   * Levels up if there is enough XP.
   * Returns if Player has leveled up
   */
  private addXP(xp: number): boolean {
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
    this._emitLevelingProgress(isLevelingUp);
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

  public getXPOfLevel(level: number): number {
    this._getData();
    return this.getLevelXP(level);
  }

  public getLevelSubject(): Subject<IXpChangeMessage> {
    return this.levelSubject;
  }

  private _emitLevelingProgress(levelingUp: boolean): void {
    this.levelSubject.next({
      progressPercentage: this.getCurrentLevelProgressPercentage(),
      isNewLevel: levelingUp,
    });
  }

  public getCurrentLevelProgressPercentage(): number {
    const xpNeeded = this.getLevelXP(this.levelProgress.level);
    const progressPercent = (100 / xpNeeded) * this.levelProgress.xp;
    return progressPercent;
  }

  //Categories
  public getAllCategories(): ICategory[] {
    this._getData();
    return this.categories;
  }

  public getCategoryById(id: string): ICategory | undefined {
    this._getData();
    for (let category of this.categories) {
      if (id == category.id) {
        return category;
      }
    }
    return undefined;
  }

  public deleteCategory(category: ICategory): void {
    let categoryToDelete = this.getCategoryById(category.id);
    if (categoryToDelete) {
      let index = this.categories.indexOf(categoryToDelete, 0);
      //set Priority of all following indexes lower
      for (let i = category.priorityPlace; i < this.categories.length; i++) {
        let otherCategory = this.findCategoryByPriority(i);
        if (otherCategory) {
          otherCategory.priorityPlace--;
        }
      }
      //set category for all tasks that used this to default
      for (let i = 0; i < this.allTasks.length; i++) {
        if (this.allTasks[i].categoryId == category.id) {
          this.allTasks[i].categoryId = 'default';
        }
      }
      //delete
      if (index > -1) {
        this.categories.splice(index, 1);
      }
    }
    this._setData();
  }

  public addNewCategory(category: ICategory): void {
    category.priorityPlace = this.categories.length;
    this.categories.push(category);
    this._setData();
  }

  public demoteCategoryPriority(category: ICategory): void {
    let categoryToPromote = this.getCategoryById(category.id);
    if (categoryToPromote) {
      if (categoryToPromote.priorityPlace < this.categories.length) {
        let categoryToDemote = this.findCategoryByPriority(
          categoryToPromote.priorityPlace + 1
        );
        if (categoryToDemote) {
          categoryToPromote.priorityPlace = categoryToDemote.priorityPlace;
          categoryToDemote.priorityPlace = categoryToDemote.priorityPlace - 1;
        }
      }
    }
    this._setData();
  }

  public promoteCategoryPriority(category: ICategory): void {
    let categoryToDemote = this.getCategoryById(category.id);
    if (categoryToDemote) {
      if (categoryToDemote.priorityPlace > 0) {
        let categoryToPromote = this.findCategoryByPriority(
          categoryToDemote.priorityPlace - 1
        );
        if (categoryToPromote) {
          categoryToDemote.priorityPlace = categoryToPromote.priorityPlace;
          categoryToPromote.priorityPlace = categoryToPromote.priorityPlace + 1;
        }
      }
    }
    this._setData();
  }

  private findCategoryByPriority(priority: number): ICategory | undefined {
    for (let category of this.categories) {
      if (category.priorityPlace == priority) {
        return category;
      }
    }
    return undefined;
  }

  public editCategory(category: ICategory): void {
    let categoryToEdit = this.getCategoryById(category.id);
    if (categoryToEdit) {
      categoryToEdit.name = category.name;
      categoryToEdit.color = category.color;
    }
    this._setData();
  }
}
