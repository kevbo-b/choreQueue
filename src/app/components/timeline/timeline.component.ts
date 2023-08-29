import { Component, OnInit } from '@angular/core';
import { ITask } from 'src/app/models/task';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  public tasks: ITask[] = [];

  public constructor(public readonly saveService: SaveService) {}

  ngOnInit(): void {
    this.tasks = this.saveService.getAllTasks();
    //TODO: sort correctly (due date based)
  }

  skipTask(task: ITask) {
    this.saveService.completeTask(task, false);
  }

  completeTask(task: ITask) {
    this.saveService.completeTask(task);
  }
}
