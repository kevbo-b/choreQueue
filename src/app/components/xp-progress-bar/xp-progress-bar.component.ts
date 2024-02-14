import { Component, Input, OnInit } from '@angular/core';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'app-xp-progress-bar',
  templateUrl: './xp-progress-bar.component.html',
  styleUrls: ['./xp-progress-bar.component.scss'],
})
export class XpProgressBarComponent implements OnInit {
  public progress = -1;
  public level = -1;
  public useEmoji = true;

  @Input() public useAsFixedBar = true;

  public constructor(public readonly saveService: SaveService) {}

  ngOnInit(): void {
    this.progress = this.saveService.getCurrentLevelProgressPercentage();
    this.level = this.saveService.getLevelProgress().level;
    this.saveService.getLevelSubject().subscribe((xpChange) => {
      if (xpChange.isNewLevel) {
        //TODO: special animation etc.
        this.level = this.level + 1;
      }
      this.progress = xpChange.progressPercentage;
    });
  }

  public getLevelEmoji(lvl: number): string {
    return String.fromCodePoint(parseInt('1F600', 16) + lvl);
  }
}
