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

  miniTasks: ITask[] = [];
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
  }

  // addMiniTask(): void {
  //   //validation
  //   if (this.xpField < 0 || this.xpField > this.MAX_XP) {
  //     alert('Error: Not saved! Wrong inputs in XP.');
  //   } else {
  //     this.saveService.addNewMiniTask({
  //       id: uuid(),
  //       title: this.titleField,
  //       xp: this.xpField,
  //       addToLastDueDate: false,
  //       categoryId: 'miniTask',
  //       description: '',
  //       interval: {
  //         method: IntervalMethod.NeverRepeat,
  //         num: -1,
  //       },
  //       nextDueDate: '',
  //     });
  //     this.titleField = '';
  //     this.getData();
  //     alert('Mini-task Created!');
  //   }
  // }

  onCheckChange(event: any, miniTask: ITask) {
    console.log(event.target.checked);
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
