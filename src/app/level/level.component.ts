import { Component, OnInit } from '@angular/core';
import { SaveService } from '../services/save.service';
import { ILevelProgress } from '../models/task';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss'],
})
export class LevelComponent implements OnInit {
  public constructor(public readonly saveService: SaveService) {}

  public levelProgress: ILevelProgress = {
    level: -1,
    xp: -1,
  };
  public neededXP = -1;

  ngOnInit(): void {
    this.levelProgress = this.saveService.getLevelProgress();
    this.neededXP = this.saveService.getXPOfLevel(this.levelProgress.level);
  }
}
