import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss'],
})
export class EditListComponent {
  public constructor(public readonly router: Router) {}

  redirect(path: string): void {
    this.router.navigate([path]);
  }
}
