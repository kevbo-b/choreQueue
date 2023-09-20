import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICategory, ITask, IntervalMethod } from 'src/app/models/task';
import { SaveService } from 'src/app/services/save.service';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-mini-task-list',
  templateUrl: './mini-task-list.component.html',
  styleUrls: ['./mini-task-list.component.scss'],
})
export class MiniTaskListComponent implements OnInit {
  miniTasks: ITask[] = [];

  public xpField = 50;
  public titleField = '';

  public categories: ICategory[] = [];

  public MAX_XP = 1000;

  public constructor(
    public readonly router: Router,
    public readonly saveService: SaveService
  ) {}

  ngOnInit(): void {
    this.categories = this.saveService.getAllCategories();
    this.getData();
  }

  getData() {
    this.miniTasks = this.saveService.getAllMiniTasks();
  }

  redirect(path: string): void {
    this.router.navigate([path]);
  }

  deleteMiniTask(miniTask: ITask): void {
    this.saveService.deleteMiniTask(miniTask);
    this.getData();
  }

  addMiniTask(): void {
    //validation
    if (
      this.titleField == '' ||
      this.xpField < 0 ||
      this.xpField > this.MAX_XP
    ) {
      alert('Error: Not saved! Wrong inputs in Title or XP.');
    } else {
      this.saveService.addNewMiniTask({
        id: uuid(),
        title: this.titleField,
        xp: this.xpField,
        addToLastDueDate: false,
        categoryId: 'default',
        description: '',
        interval: {
          method: IntervalMethod.NeverRepeat,
          num: -1,
        },
        nextDueDate: '',
        timesSkipped: 0,
      });
      this.titleField = '';
      this.getData();
    }
  }

  getCategoryColor(miniTask: ITask): string {
    for (let category of this.categories) {
      if (category.id == miniTask.categoryId) {
        return category.color;
      }
    }
    return '#4444bb';
  }
}
