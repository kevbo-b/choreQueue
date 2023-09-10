import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public constructor(public readonly router: Router) {}

  public showMiniTaskPopup = false;

  redirectToEditor(): void {
    this.router.navigate(['/edit/new'], {
      queryParams: { redirectedFrom: 'home' },
    });
  }

  popupMiniTasks(): void {
    this.showMiniTaskPopup = true;
  }

  onMiniTasksSelected(): void {
    this.showMiniTaskPopup = false;
  }
}
