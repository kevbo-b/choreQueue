import { Injectable } from '@angular/core';
import {
  ICategory,
  IHistoryEntry,
  ILevelProgress,
  ITask,
  ITimelineAction,
  IXpChangeMessage,
  IntervalMethod,
} from '../models/task';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { IConfigDataTransfer } from '../models/options';
import {
  convertDateToString,
  getDisplayDueDate,
  getNextDueDate,
} from '../models/task-helper-funcions';

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
    color: '#4444BBFF',
    priorityPlace: 0,
    hidden: false,
  };
  private categoriesKey = 'taskCategories';

  private miniTasks: ITask[] = [];
  private miniTasksKey: string = 'miniTasks';

  private history: IHistoryEntry[] = [];
  private historyKey: string = 'history';

  private levelSubject = new Subject<IXpChangeMessage>();

  private onChangeSubject = new Subject<ITask[]>();

  private isFrozen = false;
  private isFrozenKey: string = 'freezeState';

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
    //mini tasks
    let miniTasks = JSON.parse(
      localStorage.getItem(this.miniTasksKey) as string
    ) as unknown as ITask[];
    if (miniTasks && miniTasks.length > 0) {
      this.miniTasks = miniTasks;
    }
    //history
    let history = JSON.parse(
      localStorage.getItem(this.historyKey) as string
    ) as unknown as IHistoryEntry[];
    if (history && history.length > 0) {
      this.history = history;
    }
    //freeze
    let isFrozen = JSON.parse(
      localStorage.getItem(this.isFrozenKey) as string
    ) as unknown as boolean;
    if (isFrozen) {
      this.isFrozen = isFrozen;
    } else {
      this.isFrozen = false;
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
    localStorage.setItem(this.isFrozenKey, JSON.stringify(this.isFrozen));
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
    this._handleFreezeCalculation(task);
    this.allTasks.push(task);
    this._setData();
  }

  public editTask(task: ITask): void {
    let taskToEdit = this.getTaskById(task.id);
    if (taskToEdit) {
      taskToEdit.title = task.title;
      taskToEdit.description = task.description;
      taskToEdit.nextDueDate = task.nextDueDate;
      taskToEdit.addToLastDueDate = task.addToLastDueDate;
      taskToEdit.interval = task.interval;
      taskToEdit.xp = task.xp;
      taskToEdit.categoryId = task.categoryId;
    }
    this._handleFreezeCalculation(task);
    this._setData();
  }

  public deleteTask(task: ITask): void {
    let taskToEdit = this.getTaskById(task.id);
    if (taskToEdit) {
      this.saveToHistory(taskToEdit, ITimelineAction.Delete);
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

  public completeTask(inputtedTask: ITask): void {
    var task = this.getTaskById(inputtedTask.id);
    if (task) {
      this.saveToHistory(task, ITimelineAction.Complete);
      this.addXP(inputtedTask.xp);
      if (task.interval.method == IntervalMethod.NeverRepeat) {
        this.deleteTask(task);
        return;
      }
      task.nextDueDate = getNextDueDate(
        task,
        task.interval.method,
        task.interval.num
      );
      task.timesSkipped = 0;
      this._handleFreezeCalculation(task);
      this._setData();
    }
  }

  private _handleFreezeCalculation(task: ITask) {
    if (this.isFrozen) {
      //set freeze date to today
      task.freezeDate = convertDateToString(new Date());
    }
    console.log(task, task.freezeDate);
  }

  public skipTask(
    inputtedTask: ITask,
    intervalMethod: IntervalMethod,
    amountToSkip: number
  ): void {
    var task = this.getTaskById(inputtedTask.id);
    if (task) {
      this.saveToHistory(task, ITimelineAction.Move);
      task.nextDueDate = getNextDueDate(
        inputtedTask,
        intervalMethod,
        amountToSkip,
        true
      );
      task.timesSkipped++;
      this._handleFreezeCalculation(task);
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
  public getAllMiniTasks(): ITask[] {
    this._getData();
    return this.miniTasks;
  }

  public deleteMiniTask(minitask: ITask): void {
    let taskToEdit = this.getMiniTaskById(minitask.id);
    if (taskToEdit) {
      let index = this.miniTasks.indexOf(taskToEdit, 0);
      if (index > -1) {
        this.miniTasks.splice(index, 1);
      }
    }
    this._setData();
  }

  public getMiniTaskById(id: string): ITask | undefined {
    this._getData();
    for (let miniTask of this.miniTasks) {
      if (id == miniTask.id) {
        return miniTask;
      }
    }
    return undefined;
  }

  public addNewMiniTask(miniTask: ITask): void {
    this.miniTasks.push(miniTask);
    this._setData();
  }

  public addMiniTasksToQueue(miniTasks: ITask[]): void {
    this._getData();
    for (let miniTask of miniTasks) {
      miniTask.nextDueDate = convertDateToString(new Date());
    }
    this.allTasks = [...this.allTasks, ...miniTasks];
    this._setData();
  }

  public getOnChangeSubject(): Subject<ITask[]> {
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

  private saveToHistory(task: ITask, action: ITimelineAction) {
    let newHistoryEntry: IHistoryEntry = {
      taskId: task.id,
      date: convertDateToString(new Date()),
      action: action,
      objectBeforeAction: _.cloneDeep(task),
    };
    if (action === ITimelineAction.Complete) {
      newHistoryEntry.xpGain = task.xp;
    }
    this.history.push(newHistoryEntry);
  }

  public getHistory(): IHistoryEntry[] {
    this._getData();
    return this.history;
  }

  public undoHistoryAction(): void {
    let historyEntry = this.history.pop();
    this._setData();
    if (historyEntry) {
      const task = this.getTaskById(historyEntry.taskId);
      if (historyEntry.action === ITimelineAction.Complete && task) {
        let taskIndex = this.allTasks.indexOf(task);
        if (this.allTasks[taskIndex] && historyEntry.objectBeforeAction) {
          this.allTasks[taskIndex] = historyEntry.objectBeforeAction;
          //reverse level
          this.levelProgress.xp =
            this.levelProgress.xp - this.allTasks[taskIndex].xp;
          while (this.levelProgress.xp < 0) {
            this.levelProgress.level = this.levelProgress.level - 1;
            this.levelProgress.xp =
              this.levelProgress.xp + this.getLevelXP(this.levelProgress.level);
          }
        }
      } else if (historyEntry.action === ITimelineAction.Move && task) {
        let taskIndex = this.allTasks.indexOf(task);
        if (this.allTasks[taskIndex] && historyEntry.objectBeforeAction) {
          this.allTasks[taskIndex] = historyEntry.objectBeforeAction;
        }
      } else if (historyEntry.action === ITimelineAction.Delete) {
        if (historyEntry.objectBeforeAction) {
          this.addNewTask(historyEntry.objectBeforeAction);
        }
      }
      this._setData();
      this.emitOnChangesSubject();
      this._emitLevelingProgress(false);
    }
  }

  public activateFreeze(): void {
    this._getData();
    const today = convertDateToString(new Date());
    for (const task of this.allTasks) {
      if (task.addToLastDueDate) {
        //... disregard?
      } else {
        task.freezeDate = today;
      }
    }
    this.isFrozen = true;
    this._setData();
    this.emitOnChangesSubject();
  }

  public deactivateFreeze(): void {
    this._getData();
    for (const task of this.allTasks) {
      if (task.addToLastDueDate) {
        //... disregard?
      } else if (task.freezeDate) {
        task.nextDueDate = getDisplayDueDate(task);
        delete task.freezeDate;
      }
    }
    this.isFrozen = false;
    this._setData();
    this.emitOnChangesSubject();
  }

  public getFreezeState(): boolean {
    return this.isFrozen;
  }
}
