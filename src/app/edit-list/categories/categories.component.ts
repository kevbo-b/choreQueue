import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ICategory } from 'src/app/models/task';
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
    this.categories = this.saveService.getAllCategories();
  }

  redirect(path: string): void {
    this.router.navigate([path]);
  }

  deleteCategory(categoryToDelete: ICategory): void {
    if (
      confirm(
        `Are you sure you want to delete "${categoryToDelete.name}" permanently?`
      ) == true
    ) {
      this.saveService.deleteCategory(categoryToDelete);
      let index = this.categories.indexOf(categoryToDelete, 0);
      if (index > -1) {
        this.categories.splice(index, 1);
      }
    }
  }
}