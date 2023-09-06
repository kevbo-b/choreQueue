import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICategory } from 'src/app/models/task';
import { SaveService } from 'src/app/services/save.service';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-category-editor',
  templateUrl: './category-editor.component.html',
  styleUrls: ['./category-editor.component.scss'],
})
export class CategoryEditorComponent {
  public constructor(
    public readonly router: Router,
    public readonly activeRoute: ActivatedRoute,
    public readonly saveService: SaveService
  ) {}

  createNew = false;
  categoryId = '';
  public category: ICategory = {
    id: '',
    color: '',
    name: '',
    priorityPlace: -1,
  };

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Record<string, string>) => {
      if ('id' in params) {
        this.categoryId = params['id'];
        if (this.categoryId && this.categoryId !== 'new') {
          let category = this.saveService.getCategoryById(this.categoryId);
          if (category) {
            this.category = category;
          } else {
            alert(`Task with the ID ${this.categoryId} not found`);
            this.createNew = true;
          }
        } else {
          this.createNew = true;
        }
      }
    });
  }

  onSavePressed(): void {
    //validation
    if (this.category.name === '' || this.category.color === '') {
      alert('Error: Not saved! Wrong inputs in name or color.');
    } else {
      //if inputs are ok...
      if (this.createNew) {
        this.category.id = uuid();
        this.saveService.addNewCategory(this.category);
        this.createNew = false;
        alert('Category Created!');
      } else {
        this.saveService.editCategory(this.category);
        alert('Category Edited!');
      }
    }
  }

  onBackPressed(): void {
    this.router.navigate(['/categories']);
  }
}
