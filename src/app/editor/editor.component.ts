import { Component, OnInit } from '@angular/core';
import { ICategory, ITask, IntervalMethod } from '../models/task';
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
    interval: {
      method: IntervalMethod.Day,
      num: 7,
    },
    addToLastDueDate: false,
    xp: 100,
    categoryId: 'default',
  };
  public intervalMethod = IntervalMethod;
  public categories: ICategory[] = [];

  public MAX_XP = 1000;
  private redirectedFrom = 'edit';

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
        this.categories = this.saveService.getAllCategories();
      }
    });

    this.activeRoute.queryParams.subscribe((params) => {
      if ('redirectedFrom' in params) {
        this.redirectedFrom = params['redirectedFrom'];
      }
    });
  }

  onIntervalMethodChange(): void {
    if (this.task.interval.method == this.intervalMethod.NeverRepeat) {
      this.task.addToLastDueDate = false;
    }
  }

  onCategoryChange(): void {}

  onSavePressed(): void {
    //validation
    if (
      this.task.title === '' ||
      this.task.nextDueDate === '' ||
      this.task.interval.num < 1 ||
      this.task.xp < 0 ||
      this.task.xp > this.MAX_XP
    ) {
      alert(
        'Error: Not saved! Wrong inputs in title, nextDueDate, interval or XP.'
      );
    } else {
      //if inputs are ok...
      if (this.createNew) {
        this.task.id = uuid();
        this.saveService.addNewTask(this.task);
        this.createNew = false;
        alert('Task Created!');
      } else {
        this.saveService.editTask(this.task);
        alert('Task Edited!');
      }
    }
  }

  onBackPressed(): void {
    this.router.navigate(['/' + this.redirectedFrom]);
  }
}
