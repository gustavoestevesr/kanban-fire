import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Firestore,
  collectionData,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from './model/task';
import { TaskDialogResult } from './model/task-dialog-result';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { addDoc, CollectionReference, DocumentData } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'kanban-fire';

  private toDoCollection: CollectionReference<DocumentData>;
  private inProgressCollection: CollectionReference<DocumentData>;
  private doneCollection: CollectionReference<DocumentData>;

  toDo$?: Observable<Task[]>;
  inProgress$?: Observable<Task[]>;
  done$?: Observable<Task[]>;

  ngOnInit(): void {
    this.toDo$ = this.getAllToDo();
    this.inProgress$ = this.getAllInProgress();
    this.done$ = this.getAllDone();
  }

  constructor(private dialog: MatDialog, private firestore: Firestore) {
    this.toDoCollection = collection(this.firestore, 'toDo');
    this.inProgressCollection = collection(this.firestore, 'inProgress');
    this.doneCollection = collection(this.firestore, 'done');
  }

  private readonly widthMatDialog: string = '400px';

  getAllToDo() {
    return collectionData(this.toDoCollection, {
      idField: 'id',
    }) as Observable<Task[]>;
  }

  getAllInProgress() {
    return collectionData(this.inProgressCollection, {
      idField: 'id',
    }) as Observable<Task[]>;
  }

  getAllDone() {
    return collectionData(this.doneCollection, {
      idField: 'id',
    }) as Observable<Task[]>;
  }

  editTask(list: 'done' | 'toDo' | 'inProgress', task: Task) {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: this.widthMatDialog,
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        if (result.delete) {
          deleteDoc(doc(this.firestore, `${list}/${task.id}`));
        } else {
          updateDoc(doc(this.firestore, `${list}/${task.id}`), { ...task })
        }
      });
  }

  drop(event: CdkDragDrop<any>): void {
    if (event.previousContainer === event.container) {
      return
    }
    const item = event.previousContainer.data[event.previousIndex];

    deleteDoc(doc(this.firestore, `${event.previousContainer.id}/${item.id}`));
    if (event.container.id == 'toDo') {
      addDoc(this.toDoCollection, item);
    } else if (event.container.id == 'done') {
      addDoc(this.doneCollection, item);
    } else if (event.container.id == 'inProgress') {
      addDoc(this.inProgressCollection, item);
    }

  }

  newTask() {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: this.widthMatDialog,
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        addDoc(this.toDoCollection, result.task);
      });
  }
}
