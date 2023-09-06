import { Component, OnInit } from '@angular/core';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-xp-progress-bar',
  templateUrl: './xp-progress-bar.component.html',
  styleUrls: ['./xp-progress-bar.component.scss'],
})
export class XpProgressBarComponent implements OnInit {
  public progress = -1;

  public constructor(public readonly saveService: SaveService) {}

  ngOnInit(): void {
    this.progress = this.saveService.getCurrentLevelProgressPercentage();
    this.saveService.getLevelSubject().subscribe((xpChange) => {
      this.progress = xpChange.progressPercentage;
      if (xpChange.isNewLevel) {
        //TODO: special animation etc.
      }
    });
  }
}
