import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavigationComponent } from './navigation/navigation.component';
import { LevelComponent } from './level/level.component';
import { EditListComponent } from './edit-list/edit-list.component';
import { EditorComponent } from './editor/editor.component';
import { FormsModule } from '@angular/forms';
import { SaveService } from './services/save.service';
import { TimelineComponent } from './components/timeline/timeline.component';
import { TaskPanelComponent } from './components/task-panel/task-panel.component';
import { XpProgressBarComponent } from './components/xp-progress-bar/xp-progress-bar.component';
import { CategoriesComponent } from './edit-list/categories/categories.component';
import { CategoryEditorComponent } from './edit-list/categories/category-editor/category-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationComponent,
    LevelComponent,
    EditListComponent,
    EditorComponent,
    TimelineComponent,
    TaskPanelComponent,
    XpProgressBarComponent,
    CategoriesComponent,
    CategoryEditorComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [SaveService],
  bootstrap: [AppComponent],
})
export class AppModule {}
