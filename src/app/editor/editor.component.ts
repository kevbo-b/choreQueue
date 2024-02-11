import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuid } from 'uuid';
import { SaveService } from '../services/save.service';
import * as _ from 'lodash';
import { Task } from '../models/task-class';
import { ICategory, IntervalMethod } from '../models/task-interfaces';

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
  public task: Task = new Task();
  public intervalMethod = IntervalMethod;
  public categories: ICategory[] = [];
  public date = '';

  public isFrozen = false;

  public MAX_XP = 1000;
  private redirectedFrom = 'edit';

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Record<string, string>) => {
      if ('id' in params) {
        this.taskId = params['id'];
        if (this.taskId && this.taskId !== 'new') {
          let task = _.cloneDeep(this.saveService.getTaskById(this.taskId));
          if (task) {
            this.task = task;
            this.date = task.getDisplayDueDate();
            if (this.task.freezeDate) {
              this.isFrozen = true;
            }
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
      if ('dayPreset' in params) {
        this.date = params['dayPreset'];
      }
    });
  }

  onIntervalMethodChange(): void {
    if (this.task.interval.method == this.intervalMethod.NeverRepeat) {
      this.task.addToLastDueDate = false;
    }
  }

  onSavePressed(): void {
    //validation
    if (
      this.task.title === '' ||
      this.date === '' ||
      (this.task.interval.num < 1 &&
        this.task.interval.method !== IntervalMethod.NeverRepeat) ||
      this.task.xp < 0 ||
      this.task.xp > this.MAX_XP
    ) {
      alert(
        'Error: Not saved! Wrong inputs in title, nextDueDate, interval or XP.'
      );
    } else {
      //if inputs are ok, set & save them
      this.task.setNextDueDateValue(this.date);
      if (this.isFrozen) {
        this.task.activateFreeze();
      } else {
        this.task.deactivateFreeze();
      }
      if (this.createNew) {
        this.task.id = uuid();
        this.saveService.addNewTask(this.task);
        this.createNew = false;
        alert('Task Created!');
        this.task = _.cloneDeep(this.task); //decouple reference
      } else {
        this.saveService.editTask(this.task);
        alert('Task Edited!');
        this.task = _.cloneDeep(this.task); //decouple reference
      }
      this.date = this.task.getDisplayDueDate();
    }
  }

  onBackPressed(): void {
    this.router.navigate(['/' + this.redirectedFrom]);
  }
}
