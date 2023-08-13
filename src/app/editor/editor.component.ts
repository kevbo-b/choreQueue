import { Component, OnInit } from '@angular/core';
import { ITask } from '../models/task';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
  public constructor(
    public readonly router: Router,
    public readonly activeRoute: ActivatedRoute
  ) {}

  createNew = false;
  taskId = '';
  public task: ITask = {
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
          //TODO: get task from id (with service)
        } else {
          this.createNew = true;
        }
      }
    });
  }

  onSavePressed(): void {
    console.log(this.task);
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
      //TODO: save (with service)
      if (this.createNew) {
        alert('Task Created!');
      } else {
        alert('Task Edited!');
      }
    }
  }

  onBackPressed(): void {
    this.router.navigate(['/edit']);
  }
}
