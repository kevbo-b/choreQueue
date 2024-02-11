import { Component, Input, OnInit } from '@angular/core';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-xp-progress-bar',
  templateUrl: './xp-progress-bar.component.html',
  styleUrls: ['./xp-progress-bar.component.scss'],
})
export class XpProgressBarComponent implements OnInit {
  public progress = -1;

  @Input() public useAsFixedBar = true;

  public constructor(public readonly saveService: SaveService) {}

  ngOnInit(): void {
    this.progress = this.saveService.getCurrentLevelProgressPercentage();
    this.saveService.getLevelSubject().subscribe((xpChange) => {
      if (xpChange.isNewLevel) {
        //TODO: special animation etc.
      }
      this.progress = xpChange.progressPercentage;
    });
  }
}
