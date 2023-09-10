import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniTaskSelectorComponent } from './mini-task-selector.component';

describe('MiniTaskSelectorComponent', () => {
  let component: MiniTaskSelectorComponent;
  let fixture: ComponentFixture<MiniTaskSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MiniTaskSelectorComponent]
    });
    fixture = TestBed.createComponent(MiniTaskSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
