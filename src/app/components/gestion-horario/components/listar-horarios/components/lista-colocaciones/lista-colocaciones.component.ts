import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { colocacionesContructorTabla } from './utilidades';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'udistrital-lista-colocaciones',
  templateUrl: './lista-colocaciones.component.html',
  styleUrl: './lista-colocaciones.component.scss',
})
export class ListaColocacionesComponent implements OnInit, AfterViewInit {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  @Input() colocaciones: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  colocacionesMat: MatTableDataSource<any> = new MatTableDataSource();
  colocacionesContructorTabla: any;
  colocacionesSeleccionadas: any[] = [];
  tablaColumnas: any;

  constructor(private cdref: ChangeDetectorRef) {}

  ngOnInit() {
    console.log(this.colocaciones);
  }

  ngAfterViewInit(): void {
    this.construirTabla();
    this.cdref.detectChanges();
  }

  construirTabla() {
    this.colocacionesContructorTabla = colocacionesContructorTabla;
    this.tablaColumnas = this.colocacionesContructorTabla.map(
      (column: any) => column.columnDef
    );
    //Asigna la info a la tabla
    this.colocacionesMat = new MatTableDataSource(this.colocaciones);
    this.colocacionesMat.paginator = this.paginator;
    this.colocacionesMat.sort = this.sort;
  }

  //Para la funcionalidad del checkbox, para selecionar todos
  toggleAllCheckboxes(event: MatCheckboxChange) {
    if (event.checked) {
      this.colocacionesSeleccionadas = this.colocacionesMat.data.slice();
    } else {
      this.colocacionesSeleccionadas = [];
    }
    this.colocacionesMat.data.forEach(
      (row: any) => (row.isSelected = event.checked)
    );
  }

  isAllSelected() {
    const numSelected = this.colocacionesSeleccionadas.length;
    const numRows = this.colocacionesMat.data.length;
    return numSelected === numRows;
  }

  isSomeSelected() {
    const numSelected = this.colocacionesSeleccionadas.length;
    const numRows = this.colocacionesMat.data.length;
    return numSelected > 0 && numSelected < numRows;
  }

  checkboxEspacioAcademico(espacio: any): void {
    if (espacio.isSelected) {
      this.colocacionesSeleccionadas.push(espacio);
    } else {
      this.colocacionesSeleccionadas = this.colocacionesSeleccionadas.filter(
        (selectedRow: any) => selectedRow !== espacio
      );
    }
    // Actualiza el estado del checkbox de selección masiva
    this.cdref.detectChanges();
  }
}
