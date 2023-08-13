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

  public getAllTasks(): ITask[] {
    this._getData();
    return this.allTasks;
  }
}
