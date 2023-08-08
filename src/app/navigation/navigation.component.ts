import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  public constructor(public readonly router: Router) {}

  redirect(path: string): void {
    this.router.navigate([path]);
  }
}
