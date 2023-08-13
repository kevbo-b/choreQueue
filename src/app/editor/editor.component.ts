import { Component, OnInit } from '@angular/core';
import { ITask } from '../models/task';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { SaveService } from '../services/save.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
  public constructor(
    public readonly router: Router,
    public readonly activeRoute: ActivatedRoute,
    public readonly saveService: SaveService
  ) {}

  createNew = false;
  taskId = '';
  public task: ITask = {
    id: '',
    title: '',
    description: '',
    nextDueDate: '',
    intervalInDays: 7,
    xp: 100,
  };

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Record<string, string>) => {
      if ('id' in params) {
        this.taskId = params['id'];
        if (this.taskId && this.taskId !== 'new') {
          let task = this.saveService.getTaskById(this.taskId);
          if (task) {
            this.task = task;
          } else {
            alert(`Task with the ID ${this.taskId} not found`);
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
      this.task.title === '' ||
      this.task.nextDueDate === '' ||
      this.task.intervalInDays < 1
    ) {
      alert(
        'Error: Not saved! Wrong inputs in title, nextDueDate, or intervalInDays.'
      );
    } else {
      //if inputs are ok...
      if (this.createNew) {
        this.task.id = uuid();
        this.saveService.addNewTask(this.task);
        alert('Task Created!');
      } else {
        this.saveService.editTask(this.task);
        alert('Task Edited!');
      }
    }
  }

  onBackPressed(): void {
    this.router.navigate(['/edit']);
  }
}
