import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XpProgressBarComponent } from './xp-progress-bar.component';

describe('XpProgressBarComponent', () => {
  let component: XpProgressBarComponent;
  let fixture: ComponentFixture<XpProgressBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [XpProgressBarComponent]
    });
    fixture = TestBed.createComponent(XpProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
