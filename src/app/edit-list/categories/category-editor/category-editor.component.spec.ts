import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryEditorComponent } from './category-editor.component';

describe('CategoryEditorComponent', () => {
  let component: CategoryEditorComponent;
  let fixture: ComponentFixture<CategoryEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryEditorComponent]
    });
    fixture = TestBed.createComponent(CategoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
