import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ITask } from 'src/app/models/task';

@Component({
  selector: 'app-task-panel',
  templateUrl: './task-panel.component.html',
  styleUrls: ['./task-panel.component.scss'],
})
export class TaskPanelComponent {
  @Input() public task: ITask | undefined;
  @Input() public due: boolean = true;
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
}
