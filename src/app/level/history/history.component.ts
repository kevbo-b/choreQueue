import { Component, OnInit } from '@angular/core';
import { IHistoryEntry, ITimelineAction } from 'src/app/models/task';
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

  ngOnInit(): void {
    this.allHistroyEntries = this.saveService.getHistory();
    this.filterCompleteTasks();
  }

  public filterCompleteTasks() {
    this.completionHistoryEntries = this.allHistroyEntries.filter((entry) => {
      return entry.action === ITimelineAction.Complete;
    });
    this.completionHistoryEntries.reverse(); //so newest completions are on top
  }
}
