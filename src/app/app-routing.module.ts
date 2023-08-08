import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LevelComponent } from './level/level.component';
import { EditorComponent } from './editor/editor.component';
import { EditListComponent } from './edit-list/edit-list.component';

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
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
