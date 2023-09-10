import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniTaskListComponent } from './mini-task-list.component';

describe('MiniTaskListComponent', () => {
  let component: MiniTaskListComponent;
  let fixture: ComponentFixture<MiniTaskListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MiniTaskListComponent]
    });
    fixture = TestBed.createComponent(MiniTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
