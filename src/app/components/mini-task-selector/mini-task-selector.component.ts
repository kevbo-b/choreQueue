import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ITask } from 'src/app/models/task';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-mini-task-selector',
  templateUrl: './mini-task-selector.component.html',
  styleUrls: ['./mini-task-selector.component.scss'],
})
export class MiniTaskSelectorComponent implements OnInit {
  @Output() public miniTasksSelected = new EventEmitter();

  allTasks: ITask[] = [];
  miniTasks: ITask[] = [];
  disabledIds: string[] = []; //Tasks that already are in the task timeline
  selectedMiniTasks: ITask[] = [];

  public constructor(
    public readonly router: Router,
    public readonly saveService: SaveService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.miniTasks = this.saveService.getAllMiniTasks();
    this.allTasks = this.saveService.getAllTasks();
    //determine disabled Tasks
    for (let miniTask of this.miniTasks) {
      for (let task of this.allTasks) {
        if (miniTask.id == task.id) {
          this.disabledIds.push(miniTask.id);
          break;
        }
      }
    }
  }

  isDisabledTask(id: string): boolean {
    for (let disabledId of this.disabledIds) {
      if (disabledId == id) {
        return true;
      }
    }
    return false;
  }

  onCheckChange(event: any, miniTask: ITask) {
    if (event.target.checked) {
      //add to list
      this.selectedMiniTasks.push(miniTask);
    } else {
      //remove from list
      for (let i = 0; i < this.selectedMiniTasks.length; i++) {
        if (this.selectedMiniTasks[i].id === miniTask.id) {
          this.selectedMiniTasks.splice(i, 1);
          return;
        }
      }
    }
  }

  emitSelectedMiniTasks() {
    this.saveService.addMiniTasksToQueue(this.selectedMiniTasks);
    this.saveService.emitOnChangesSubject();
    this.miniTasksSelected.emit();
  }
}
