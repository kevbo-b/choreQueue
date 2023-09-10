import { Component, OnInit } from '@angular/core';
import { ICategory, IDay, ITask } from 'src/app/models/task';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  private _tasks: ITask[] = [];
  public days: IDay[] = [];
  public categories: ICategory[] = [];

  public constructor(public readonly saveService: SaveService) {}

  ngOnInit(): void {
    this.buildTimelineData();
    this.saveService.getOnChangeSubject().subscribe((tasks) => {
      this._tasks = tasks;
      this.sortByDueDate();
    });
  }

  skipTask(task: ITask) {
    this.saveService.completeTask(task, false);
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

  public existsAtLeastOneDueTask() {
    for (let day of this.days) {
      for (let task of day.tasks) {
        if (this.isDue(task.nextDueDate)) {
          return true;
        }
      }
    }
    return false;
  }

  private buildTimelineData() {
    this._tasks = this.saveService.getAllTasks();
    this.categories = this.saveService.getAllCategories();
    this.sortByDueDate();
  }

  private sortByDueDate(): void {
    this.days = [];
    //Group Tasks by Day
    for (let task of this._tasks) {
      let addNew = true;
      for (let day of this.days) {
        //Add Task to existing day
        if (day.date === task.nextDueDate) {
          day.tasks.push(task);
          addNew = false;
          break;
        }
      }
      //Add new Day
      if (addNew) {
        this.days.push({
          date: task.nextDueDate,
          tasks: [task],
        });
      }
    }

    //Sort Days
    this.days.sort((a: IDay, b: IDay) => {
      return Date.parse(a.date) - Date.parse(b.date);
    });

    //Sort Tasks by Categories within days
    for (let day of this.days) {
      day.tasks.sort((a: ITask, b: ITask) => {
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
    }
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
}
