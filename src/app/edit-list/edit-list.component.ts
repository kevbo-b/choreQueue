import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaveService } from '../services/save.service';
import { ICategory, ITask } from '../models/task';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss'],
})
export class EditListComponent implements OnInit {
  public constructor(
    public readonly router: Router,
    public readonly saveService: SaveService
  ) {}

  tasks: ITask[] = [];
  categories: ICategory[] = [];

  ngOnInit(): void {
    this.getAndSortTasks();
  }

  getAndSortTasks(): void {
    this.tasks = this.saveService.getAllTasks();
    this.categories = this.saveService.getAllCategories();
    this.tasks.sort((a: ITask, b: ITask) => {
      let catA = this.getTaskCategory(a);
      let catB = this.getTaskCategory(b);
      console.log(a, catA);

      if (catA && catB) {
        if (catA?.priorityPlace > catB?.priorityPlace) {
          return 1;
        } else {
          return -1;
        }
      }
      return 0;
    });
  }

  redirect(path: string): void {
    this.router.navigate([path]);
  }

  deleteTask(task: ITask): void {
    if (
      confirm(`Are you sure you want to delete "${task.title}" permanently?`) ==
      true
    ) {
      this.saveService.deleteTask(task);
    }
  }

  getTaskCategory(task: ITask): ICategory | undefined {
    for (let category of this.categories) {
      if (task.categoryId == category.id) {
        return category;
      }
    }
    return undefined;
  }

  getCategoryColor(task: ITask): string {
    for (let category of this.categories) {
      if (category.id == task.categoryId) {
        return category.color;
      }
    }
    return '#4444bb';
  }
}
