import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaveService } from '../services/save.service';
import { ITask } from '../models/task';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss'],
})
export class EditListComponent implements OnInit {
  public constructor(
    public readonly router: Router,
    public readonly saveService: SaveService
  ) {}

  tasks: ITask[] = [];

  ngOnInit(): void {
    this.tasks = this.saveService.getAllTasks();
  }

  redirect(path: string): void {
    this.router.navigate([path]);
  }

  deleteTask(task: ITask): void {
    if (
      confirm(`Are you sure you want to delete "${task.title}" permanently?`) ==
      true
    ) {
      this.saveService.deleteTask(task);
    }
  }
}
