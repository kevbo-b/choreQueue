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

  getCategoryColor(task: ITask): string {
    for (let category of this.categories) {
      if (category.id == task.categoryId) {
        return category.color;
      }
    }
    return '#4444bb';
  }

  dueSince(task: ITask): number {
    let today = new Date();
    let dueDate = new Date(task?.nextDueDate);

    var diff = Math.abs(today.getTime() - dueDate.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;

    return diffDays;
  }

  dueSinceStr(task: ITask): string {
    let days = this.dueSince(task);
    if (days == 0) {
      return `Due since Today`;
    } else if (days == 1) {
      return `Due since 1 day`;
    } else {
      return `Due since ${days} days`;
    }
  }
}
