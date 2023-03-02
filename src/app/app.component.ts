import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Task } from './model/task';
import { TaskDialogResult } from './model/task-dialog-result';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'kanban-fire';

  constructor(private dialog: MatDialog) {}
  private readonly widthMatDialog: string = '400px';

  todo: Task[] = [
    {
      title: 'Buy milk',
      description: 'Go to the store and buy milk',
      color: 'lightblue'
    },
    {
      title: 'Create a Kanban app',
      description: 'Using Firebase and Angular create a Kanban app!',
      color: 'lightgreen'
    }
  ];
  inProgress: Task[] = [];
  done: Task[] = [];

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: this.widthMatDialog,
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult|undefined) => {
      if (!result) {
        return;
      }
      const dataList = this[list];
      const taskIndex = dataList.indexOf(task);
      if (result.delete) {
        dataList.splice(taskIndex, 1);
      } else {
        if (result.task.title.length != 0 && result.task.description.length != 0 && result.task.color.length != 0) {
          dataList[taskIndex] = task;
        } else {
          dataList.splice(taskIndex, 1);
        }
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: this.widthMatDialog,
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult|undefined) => {
        if (!result) {
          return;
        }
        if (result.task.title.length != 0 && result.task.description.length != 0 && result.task.color.length != 0) {
          this.todo.push(result.task);
        }
      });
  }
}
