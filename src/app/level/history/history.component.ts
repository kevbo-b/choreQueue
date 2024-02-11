import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/models/task-class';
import { getTaskById } from 'src/app/models/task-helper-functions';
import { IHistoryEntry, ITimelineAction } from 'src/app/models/task-interfaces';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  public constructor(public readonly saveService: SaveService) {}

  public allHistroyEntries: IHistoryEntry[] = [];
  public completionHistoryEntries: IHistoryEntry[] = [];
  public allTasks: Task[] = [];

  ngOnInit(): void {
    this.allHistroyEntries = this.saveService.getHistory();
    this.allTasks = [
      ...this.saveService.getAllTasks(),
      ...this.saveService.getAllMiniTasks(),
    ];
    this.filterCompleteTasks();
  }

  public filterCompleteTasks() {
    this.completionHistoryEntries = this.allHistroyEntries.filter((entry) => {
      return (
        entry.action === ITimelineAction.Complete ||
        entry.action === ITimelineAction.DeleteAndComplete
      );
    });
    this.completionHistoryEntries.reverse(); //so newest completions are on top
  }

  public getTitle(taskId: string): string {
    let task = getTaskById(taskId, this.allTasks);
    if (task) {
      return task.title;
    }
    return taskId;
  }

  public clearHistory(): void {
    if (
      confirm(
        'Clear History? This cannot be undone. (XP and level will still be kept)'
      )
    ) {
      this.saveService.clearHistory();
      this.completionHistoryEntries = [];
    }
  }
}
