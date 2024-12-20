import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICategory } from 'src/app/models/task-interfaces';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  public constructor(
    public readonly router: Router,
    public readonly saveService: SaveService
  ) {}

  categories: ICategory[] = [];

  ngOnInit(): void {
    this.getAndSortCategories();
  }

  getAndSortCategories(): void {
    this.categories = this.saveService.getAllCategories();
    this.categories.sort((a: ICategory, b: ICategory) => {
      return a.priorityPlace - b.priorityPlace;
    });
  }

  redirect(path: string): void {
    this.router.navigate([path]);
  }

  movePriorityUp(category: ICategory): void {
    this.saveService.promoteCategoryPriority(category);
    this.getAndSortCategories();
  }

  movePriorityDown(category: ICategory): void {
    this.saveService.demoteCategoryPriority(category);
    this.getAndSortCategories();
  }

  deleteCategory(categoryToDelete: ICategory): void {
    if (
      confirm(
        `Are you sure you want to delete "${categoryToDelete.name}" permanently?`
      ) == true
    ) {
      this.saveService.deleteCategory(categoryToDelete);
      this.getAndSortCategories();
    }
  }

  public freezeCategoryTasks(category: ICategory): void {
    //freeze
    let confirmText = `Should all tasks in the Category "${category.name}" be frozen?`;
    if (confirm(confirmText)) {
      this.saveService.freezeCategoryTasks(category.id);
    }
  }

  public unfreezeCategoryTasks(category: ICategory): void {
    //unfreeze
    let confirmText = `Should all tasks in the Category "${category.name}" be unfrozen?`;
    if (confirm(confirmText)) {
      this.saveService.unfreezeCategoryTasks(category.id);
    }
  }
}
