import { Injectable } from '@angular/core';
import { ITask, Task } from '../models/task-class';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { IConfigDataTransfer } from '../models/options';
import {
  convertDateToString,
  getTaskById,
} from '../models/task-helper-functions';
import {
  ICategory,
  IHistoryEntry,
  ILevelProgress,
  ITimelineAction,
  IXpChangeMessage,
  IntervalMethod,
} from '../models/task-interfaces';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  constructor() {}

  private allTasks: Task[] = [];
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
    color: '#4444BBFF',
    priorityPlace: 0,
    hidden: false,
  };
  private categoriesKey = 'taskCategories';

  private miniTasks: Task[] = [];
  private miniTasksKey: string = 'miniTasks';

  private history: IHistoryEntry[] = [];
  private historyKey: string = 'history';

  private levelSubject = new Subject<IXpChangeMessage>();

  private onChangeSubject = new Subject<Task[]>();

  private _getData() {
    //tasks
    if (this.allTasks.length == 0) {
      let choreTasksData = JSON.parse(
        localStorage.getItem(this.tasksKey) as string
      ) as unknown as ITask[];
      if (choreTasksData) {
        this.allTasks = this._convertITaskArrayToTaskClass(choreTasksData);
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
    //mini tasks
    let miniTasks = JSON.parse(
      localStorage.getItem(this.miniTasksKey) as string
    ) as unknown as ITask[];
    if (miniTasks && miniTasks.length > 0) {
      this.miniTasks = this._convertITaskArrayToTaskClass(miniTasks);
    }
    //history
    let history = JSON.parse(
      localStorage.getItem(this.historyKey) as string
    ) as unknown as IHistoryEntry[];
    if (history && history.length > 0) {
      history = this._convertHistoryEntriesToTaskClass(history);
      this.history = history;
    }
  }

  private _setData() {
    localStorage.setItem(this.tasksKey, JSON.stringify(this.allTasks));
    localStorage.setItem(
      this.levelProgressKey,
      JSON.stringify(this.levelProgress)
    );
    localStorage.setItem(this.categoriesKey, JSON.stringify(this.categories));
    localStorage.setItem(this.miniTasksKey, JSON.stringify(this.miniTasks));
    localStorage.setItem(this.historyKey, JSON.stringify(this.history));
  }

  public getTaskById(id: string): Task | undefined {
    this._getData();
    return getTaskById(id, this.allTasks);
  }

  public addNewTask(task: Task): void {
    this.allTasks.push(task);
    this._setData();
  }

  public editTask(task: Task): void {
    let taskToEdit = this.getTaskById(task.id);
    if (taskToEdit) {
      taskToEdit.title = task.title;
      taskToEdit.description = task.description;
      taskToEdit.setNextDueDateValue(task.getDisplayDueDate());
      taskToEdit.addToLastDueDate = task.addToLastDueDate;
      taskToEdit.interval = task.interval;
      taskToEdit.xp = task.xp;
      taskToEdit.categoryId = task.categoryId;
      if (task.freezeDate) {
        taskToEdit.freezeDate = task.freezeDate;
      }
    }
    this._setData();
  }

  public deleteTask(task: Task, addToHistory = true): void {
    let taskToEdit = this.getTaskById(task.id);
    if (taskToEdit) {
      if (addToHistory) {
        this.saveToHistory(taskToEdit, ITimelineAction.Delete);
      }
      let index = this.allTasks.indexOf(taskToEdit, 0);
      if (index > -1) {
        this.allTasks.splice(index, 1);
      }
    }
    this._setData();
  }

  public getAllTasks(): Task[] {
    this._getData();
    return this.allTasks;
  }

  public completeTask(inputtedTask: Task): void {
    var task = this.getTaskById(inputtedTask.id);
    if (task) {
      this.addXP(inputtedTask.xp);
      if (task.interval.method == IntervalMethod.NeverRepeat) {
        this.saveToHistory(task, ITimelineAction.DeleteAndComplete);
        this._setData();
        this.deleteTask(task, false);
        return;
      } else {
        this.saveToHistory(task, ITimelineAction.Complete);
      }
      task.setNextDueDate();
      task.timesSkipped = 0;
      this._setData();
    }
  }

  public skipTask(
    inputtedTask: Task,
    intervalMethod: IntervalMethod,
    amountToSkip: number
  ): void {
    var task = this.getTaskById(inputtedTask.id);
    if (task) {
      this.saveToHistory(task, ITimelineAction.Move);
      task.setNextDueDate(intervalMethod, amountToSkip, true);
      task.timesSkipped++;
      this._setData();
    }
  }

  //-------------leveling
  public getLevelProgress(): ILevelProgress {
    this._getData();
    return this.levelProgress;
  }

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

  //-------------Categories
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

  //-------------Mini Tasks
  public getAllMiniTasks(): Task[] {
    this._getData();
    return this.miniTasks;
  }

  public deleteMiniTask(minitask: Task): void {
    let taskToEdit = this.getMiniTaskById(minitask.id);
    if (taskToEdit) {
      let index = this.miniTasks.indexOf(taskToEdit, 0);
      if (index > -1) {
        this.miniTasks.splice(index, 1);
      }
    }
    this._setData();
  }

  public getMiniTaskById(id: string): Task | undefined {
    this._getData();
    for (let miniTask of this.miniTasks) {
      if (id == miniTask.id) {
        return miniTask;
      }
    }
    return undefined;
  }

  public addNewMiniTask(miniTask: Task): void {
    this.miniTasks.push(miniTask);
    this._setData();
  }

  public addMiniTasksToQueue(miniTasks: Task[]): void {
    this._getData();
    for (let miniTask of miniTasks) {
      miniTask.setNextDueDate(IntervalMethod.NeverRepeat, 0);
    }
    this.allTasks = [...this.allTasks, ...miniTasks];
    this._setData();
  }

  public getOnChangeSubject(): Subject<Task[]> {
    return this.onChangeSubject;
  }

  public emitOnChangesSubject(): void {
    this.onChangeSubject.next(this.allTasks);
  }

  public resetData(): void {
    this.allTasks = [];
    this.categories = [_.cloneDeep(this.defaultCategory)];
    this.levelProgress = {
      level: 1,
      xp: 0,
    };
    this.miniTasks = [];
    this._setData();
  }

  //import
  public importData(data: IConfigDataTransfer): void {
    this.allTasks = data.tasks;
    this.categories = data.categories;
    this.miniTasks = data.miniTasks;
    this.levelProgress = data.level;
    this._setData();
  }

  private saveToHistory(task: Task, action: ITimelineAction) {
    let newHistoryEntry: IHistoryEntry = {
      taskId: task.id,
      date: convertDateToString(new Date()),
      action: action,
      objectBeforeAction: _.cloneDeep(task),
    };
    if (
      action === ITimelineAction.Complete ||
      action === ITimelineAction.DeleteAndComplete
    ) {
      newHistoryEntry.xpGain = task.xp;
    }
    this.history.push(newHistoryEntry);
  }

  public getHistory(): IHistoryEntry[] {
    this._getData();
    return this.history;
  }

  public undoHistoryAction(): void {
    let lastHistoryEntry = this.history[this.history.length - 1]; //last enty
    if (lastHistoryEntry && lastHistoryEntry.objectBeforeAction) {
      this.history.pop();
      this._setData();
      if (
        lastHistoryEntry.action === ITimelineAction.Delete ||
        lastHistoryEntry.action === ITimelineAction.DeleteAndComplete
      ) {
        if (lastHistoryEntry.objectBeforeAction) {
          this.addNewTask(lastHistoryEntry.objectBeforeAction);
        }
      }
      const task = this.getTaskById(lastHistoryEntry.taskId);
      if (
        task &&
        (lastHistoryEntry.action === ITimelineAction.Complete ||
          lastHistoryEntry.action === ITimelineAction.DeleteAndComplete)
      ) {
        let taskIndex = this.allTasks.indexOf(task);
        //reverse Task completion
        if (this.allTasks[taskIndex] && lastHistoryEntry.objectBeforeAction) {
          this.allTasks[taskIndex] = lastHistoryEntry.objectBeforeAction;
          //reverse level
          this.levelProgress.xp =
            this.levelProgress.xp - this.allTasks[taskIndex].xp;
          while (this.levelProgress.xp < 0) {
            this.levelProgress.level = this.levelProgress.level - 1;
            this.levelProgress.xp =
              this.levelProgress.xp + this.getLevelXP(this.levelProgress.level);
          }
        }
      }
      if (lastHistoryEntry.action === ITimelineAction.Move && task) {
        let taskIndex = this.allTasks.indexOf(task);
        if (this.allTasks[taskIndex] && lastHistoryEntry.objectBeforeAction) {
          this.allTasks[taskIndex] = lastHistoryEntry.objectBeforeAction;
        }
      }
      this._setData();
      this.emitOnChangesSubject();
      this._emitLevelingProgress(false);
    }
  }

  public freezeAllTasks(): void {
    this._getData();
    for (const task of this.allTasks) {
      task.activateFreeze();
    }
    this._resetUndo();
    this._setData();
    this.emitOnChangesSubject();
  }

  public unfreezeAlTasks(): void {
    this._getData();
    for (const task of this.allTasks) {
      task.deactivateFreeze();
    }
    this._resetUndo();
    this._setData();
    this.emitOnChangesSubject();
  }

  public freezeCategoryTasks(categoryId: string): void {
    this._getData();
    const categoryTasks = this.allTasks.filter((task) => {
      return task.categoryId === categoryId;
    });
    for (const task of categoryTasks) {
      task.activateFreeze();
    }
    this._resetUndo();
    this._setData();
    this.emitOnChangesSubject();
  }

  public unfreezeCategoryTasks(categoryId: string): void {
    this._getData();
    const categoryTasks = this.allTasks.filter((task) => {
      return task.categoryId === categoryId;
    });
    for (const task of categoryTasks) {
      task.deactivateFreeze();
    }
    this._resetUndo();
    this._setData();
    this.emitOnChangesSubject();
  }

  //--conversion from Interface to Class (used in getting Data from LocalStorage)
  private _convertITaskArrayToTaskClass(itasks: ITask[]): Task[] {
    let arr: Task[] = [];
    for (let itask of itasks) {
      arr.push(this._convertITaskToTaskClass(itask));
    }
    return arr;
  }

  private _convertITaskToTaskClass(itask: ITask): Task {
    let task = new Task();
    task.id = itask.id;
    task.title = itask.title;
    task.description = itask.description;
    task.interval = itask.interval;
    task.addToLastDueDate = itask.addToLastDueDate;
    task.xp = itask.xp;
    task.categoryId = itask.categoryId;
    task.timesSkipped = itask.timesSkipped;
    task.hidden = itask.hidden;
    task.freezeDate = itask.freezeDate;
    task.setNextDueDateValue(itask.nextDueDate);
    return task;
  }

  private _convertHistoryEntriesToTaskClass(
    historyEntries: IHistoryEntry[]
  ): IHistoryEntry[] {
    for (let entry of historyEntries) {
      if (entry.objectBeforeAction) {
        entry.objectBeforeAction = this._convertITaskToTaskClass(
          entry.objectBeforeAction as unknown as ITask
        );
      }
    }
    return historyEntries;
  }

  //Removes all previous obj's. And also removes all entries that arent a "complete" entry.
  private _resetUndo(): void {
    for (let i = this.history.length - 1; i >= 0; i--) {
      let entry = this.history[i];
      delete entry.objectBeforeAction;
      if (
        entry.action !== ITimelineAction.Complete &&
        entry.action !== ITimelineAction.DeleteAndComplete
      ) {
        this.history.splice(i);
      }
    }
    this._setData();
  }

  public clearHistory(): void {
    this.history = [];
    this._setData();
  }
}
