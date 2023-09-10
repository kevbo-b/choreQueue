import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ITask, IntervalMethod } from 'src/app/models/task';
import { SaveService } from 'src/app/services/save.service';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-mini-task-list',
  templateUrl: './mini-task-list.component.html',
  styleUrls: ['./mini-task-list.component.scss'],
})
export class MiniTaskListComponent implements OnInit {
  miniTasks: ITask[] = [];

  public xpField = 50;
  public titleField = '';

  public MAX_XP = 1000;

  public constructor(
    public readonly router: Router,
    public readonly saveService: SaveService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.miniTasks = this.saveService.getAllMiniTasks();
  }

  redirect(path: string): void {
    this.router.navigate([path]);
  }

  deleteMiniTask(miniTask: ITask): void {
    if (
      confirm(
        `Are you sure you want to delete "${miniTask.title}" permanently?`
      ) == true
    ) {
      this.saveService.deleteMiniTask(miniTask);
      this.getData();
    }
  }

  addMiniTask(): void {
    //validation
    if (this.xpField < 0 || this.xpField > this.MAX_XP) {
      alert('Error: Not saved! Wrong inputs in XP.');
    } else {
      this.saveService.addNewMiniTask({
        id: uuid(),
        title: this.titleField,
        xp: this.xpField,
        addToLastDueDate: false,
        categoryId: 'miniTask',
        description: '',
        interval: {
          method: IntervalMethod.NeverRepeat,
          num: -1,
        },
        nextDueDate: '',
      });
      this.titleField = '';
      this.getData();
      alert('Mini-task Created!');
    }
  }
}
