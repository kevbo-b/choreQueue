import { Injectable, OnInit } from '@angular/core';
import { ITask } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  constructor() {}

  private allTasks: ITask[] = [];
  private key = 'choreTasks';

  private _getData() {
    if (this.allTasks.length == 0) {
      let choreTasksData = JSON.parse(
        localStorage.getItem(this.key) as string
      ) as unknown as ITask[];
      if (choreTasksData) {
        this.allTasks = choreTasksData;
      }
    }
  }

  private _setData() {
    localStorage.setItem(this.key, JSON.stringify(this.allTasks));
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
      taskToEdit.intervalInDays = task.intervalInDays;
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
      //today + days till task should return
      var date = new Date();
      date.setDate(date.getDate() + task.intervalInDays);
      var getYear = date.toLocaleString('default', { year: 'numeric' });
      var getMonth = date.toLocaleString('default', { month: '2-digit' });
      var getDay = date.toLocaleString('default', { day: '2-digit' });
      task.nextDueDate = getYear + '-' + getMonth + '-' + getDay;
      if (gainXP) {
        //TODO: add XP of task to level
      }

      this._setData();
    }
  }
}
