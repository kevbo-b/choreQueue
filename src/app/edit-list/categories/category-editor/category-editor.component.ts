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
  color: string = '';
  opacity: number = 255;

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Record<string, string>) => {
      if ('id' in params) {
        this.categoryId = params['id'];
        if (this.categoryId && this.categoryId !== 'new') {
          let category = this.saveService.getCategoryById(this.categoryId);
          if (category) {
            this.category = category;
            this.color = this.category.color.substring(0, 7);
            this.opacity = Number('0x' + this.category.color.substring(7, 9));
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
    if (
      this.category.name === '' ||
      this.color === '' ||
      this.opacity > 255 ||
      this.opacity < 0
    ) {
      alert('Error: Not saved! Wrong inputs in name, color or opacity.');
    } else {
      //if inputs are ok...
      this.category.color = this.color + this.opacity.toString(16);
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
