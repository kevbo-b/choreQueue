import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ICategory, ITask } from 'src/app/models/task';

@Component({
  selector: 'app-task-panel',
  templateUrl: './task-panel.component.html',
  styleUrls: ['./task-panel.component.scss'],
})
export class TaskPanelComponent {
  @Input() public task: ITask | undefined;
  @Input() public due: boolean = true;
  @Input() public categories: ICategory[] = [];
  @Output() public taskSkipped = new EventEmitter();
  @Output() public taskCompleted = new EventEmitter();
  @Output() public taskDeleted = new EventEmitter();

  public showDetails = false;

  public constructor(public readonly router: Router) {}

  deletePrompt() {
    if (
      this.task &&
      confirm(
        `Are you sure you want to delete "${this.task.title}"? (This action cannot be undone!)`
      )
    ) {
      this.taskDeleted.emit();
    }
  }

  redirectToEdit(taskId: string): void {
    this.router.navigate(['/edit/' + taskId], {
      queryParams: { redirectedFrom: 'home' },
    });
  }

  getCategoryColor(taskId: ITask): string {
    for (let category of this.categories) {
      if (category.id == taskId.categoryId) {
        return category.color;
      }
    }
    return '#4444bb';
  }
}
