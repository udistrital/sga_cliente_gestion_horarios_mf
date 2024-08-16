import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { espaciosAcademicosContructorTabla } from './utilidades';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'udistrital-lista-copiar-horarios',
  templateUrl: './lista-copiar-horarios.component.html',
  styleUrl: './lista-copiar-horarios.component.scss'
})
export class ListaCopiarHorariosComponent implements OnInit, AfterViewInit {

  @Input() infoParaListaCopiarHorario: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  espaciosAcademicos: MatTableDataSource<any> = new MatTableDataSource();
  espaciosAcademicosContructorTabla: any
  espacioAcademicosSeleccionados:any[] = []
  tablaColumnas: any

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private cdref: ChangeDetectorRef
  ) {

  }
  ngAfterViewInit() {
    this.construirTabla()
    this.cdref.detectChanges();
  }

  ngOnInit() {
    console.log(this.infoParaListaCopiarHorario)
   }

   verificarCalendarioParaGestionHorario(): boolean {
    const actividadGestionHorario = this.infoParaListaCopiarHorario.actividadesCalendario?.actividadesGestionHorario[0]
    if (actividadGestionHorario == null) {
      this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_definido_proceso_para_horario_calendario"))
      return false
    }
    if (!actividadGestionHorario.DentroFechas) {
      this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_dentro_fechas_para_horario"))
      return false
    }
    return true
  }

  construirTabla() {
    this.espaciosAcademicosContructorTabla = espaciosAcademicosContructorTabla
    this.tablaColumnas = this.espaciosAcademicosContructorTabla.map((column: any) => column.columnDef);
    //Asigna la info a la tabla
    this.espaciosAcademicos = new MatTableDataSource(this.infoParaListaCopiarHorario.espaciosAcademicos);
    this.espaciosAcademicos.paginator = this.paginator;
    this.espaciosAcademicos.sort = this.sort;
  }

  checkboxEspacioAcademico(row: any): void {
    if (row.isSelected) {
      this.espacioAcademicosSeleccionados.push(row);
    } else {
      this.espacioAcademicosSeleccionados = this.espacioAcademicosSeleccionados.filter((selectedRow:any) => selectedRow !== row);
    }
    console.log(this.espacioAcademicosSeleccionados)
  }

}
