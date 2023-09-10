import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LevelComponent } from './level/level.component';
import { EditorComponent } from './editor/editor.component';
import { EditListComponent } from './edit-list/edit-list.component';
import { CategoriesComponent } from './edit-list/categories/categories.component';
import { CategoryEditorComponent } from './edit-list/categories/category-editor/category-editor.component';
import { MiniTaskListComponent } from './edit-list/mini-task-list/mini-task-list.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'edit',
    component: EditListComponent,
  },
  {
    path: 'edit/:id',
    component: EditorComponent,
  },
  {
    path: 'level',
    component: LevelComponent,
  },

  {
    path: 'categories',
    component: CategoriesComponent,
  },
  {
    path: 'categories/edit/:id',
    component: CategoryEditorComponent,
  },
  {
    path: 'miniTasks',
    component: MiniTaskListComponent,
  },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
