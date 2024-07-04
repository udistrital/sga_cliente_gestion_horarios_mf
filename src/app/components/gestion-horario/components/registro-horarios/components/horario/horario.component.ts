import { Component, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'udistrital-horario',
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.scss']
})
export class HorarioComponent {
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  tasks = ['Task 1', 'Task 2', 'Task 3'];

  items: { [key: string]: string[] } = {};

  constructor(private cdr: ChangeDetectorRef) {}

  getItems(day: string, hour: string): string[] {
    const key = `${day}-${hour}`;
    return this.items[key] || [];
  }

  getId(day: string, hour: string): string {
    return `${day}-${hour}`;
  }

  get connectedDropListsIds(): string[] {
    const ids = ['pool'];
    this.days.forEach(day => {
      this.hours.forEach(hour => {
        ids.push(this.getId(day, hour));
      });
    });
    return ids;
  }

  drop(event: CdkDragDrop<string[]>) {
    const previousContainerId = event.previousContainer.id;
    const currentContainerId = event.container.id;

    console.log(event)
  
    // Verificar si la celda de destino ya está ocupada
    if (this.isCellOccupied(currentContainerId)) {
      console.log('La celda ya está ocupada, no se puede agregar otra tarea aquí.');
      return;
    }
  
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      let task: string;
  
      // Remove task from previous container
      if (previousContainerId === 'pool') {
        task = this.tasks.splice(event.previousIndex, 1)[0];
      } else {
        if (!this.items[previousContainerId]) {
          this.items[previousContainerId] = [];
        }
        task = this.items[previousContainerId].splice(event.previousIndex, 1)[0];
      }
  
      // Add task to current container
      if (currentContainerId === 'pool') {
        this.tasks.splice(event.currentIndex, 0, task);
      } else {
        if (!this.items[currentContainerId]) {
          this.items[currentContainerId] = [];
        }
        this.items[currentContainerId].splice(event.currentIndex, 0, task);
      }
    }
  
    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }
  
  isCellOccupied(containerId: string): boolean {
    return this.items[containerId]?.length > 0;
  }
  
}
