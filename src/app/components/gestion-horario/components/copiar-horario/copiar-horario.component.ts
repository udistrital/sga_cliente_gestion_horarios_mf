import { Component, ViewChild } from '@angular/core';
import { ParametrosService } from '../../../../services/parametros.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { ordenarPorPropiedad } from '../../../../../utils/listas';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
//todo: hacer boton aceptar y copiar
@Component({
  selector: 'udistrital-copiar-horario',
  templateUrl: './copiar-horario.component.html',
  styleUrl: './copiar-horario.component.scss'
})
export class CopiarHorarioComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  tablaEspaciosAcademicosVisible: boolean = false;
  espaciosAcademicosContructorTabla: any[] = [];
  espaciosAcademicos:any
  grupo: any;
  periodo: any;
  periodos: any[] = [];
  tablaColumnas: any[] = [];
  
  periodoFormControl = new FormControl('', [Validators.required]);
  grupoFormControl = new FormControl('', [Validators.required]);
  
  subscripcion: Subscription = new Subscription()

  constructor(
    private parametrosService: ParametrosService,
    private translate: TranslateService,
  ) {
    this.cargarPeriodo()
  }

  cargarPeriodo() {
    this.subscripcion.add(this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
      .subscribe((res: any) => {
        const periodos = <any>res.Data;
        ordenarPorPropiedad(periodos, periodos.Nombre, 1)
        if (res !== null && res.Status === '200') {
          this.periodo = res.Data.find((p: any) => p.Activo);
          window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
          const periodos = <any[]>res['Data'];
          periodos.forEach(element => {
            this.periodos.push(element);
          });
        }
      }))
  }
  
  buscarEspaciosAcademicos(){
    this.tablaEspaciosAcademicosVisible = true;
    this.espaciosAcademicos = this.obtenerDatosDePrueba()
    this.construirTabla(); 
  }

  construirTabla() {
    //todo: hacer traduccion
    this.espaciosAcademicosContructorTabla = [
      { columnDef: 'proyecto', header: this.translate.instant('ptd.proyecto'), cell: (aspirante: any) => aspirante.Proyecto },
      { columnDef: 'espacio_academico', header: this.translate.instant('ptd.espacio_academico'), cell: (aspirante: any) => aspirante.EspacioAcademico },
      { columnDef: 'grupo', header: this.translate.instant('gestion_horarios.grupo'), cell: (aspirante: any) => aspirante.Grupo },
      { columnDef: 'horario', header: this.translate.instant('gestion_horarios.horario'), cell: (aspirante: any) => aspirante.Horario },
      { columnDef: 'espacio_fisico', header: this.translate.instant('gestion_horarios.espacio_academico'), cell: (aspirante: any) => aspirante.EspacioFisico },
      { columnDef: 'seleccionar', header: this.translate.instant('GLOBAL.seleccionar'), cell: (aspirante: any) => '' },
    ];
    
    this.tablaColumnas = this.espaciosAcademicosContructorTabla.map(column => column.columnDef);
    //Asigna la info a la tabla
    this.espaciosAcademicos = new MatTableDataSource(this.espaciosAcademicos);
    //Asigna el paginador
    setTimeout(()=>{this.espaciosAcademicos.paginator = this.paginator; }, 1000)
  }

  copiarEspacioAcademico(){

  }

  ocultarCopiarHorario(){

  }

  obtenerDatosDePrueba() {
    return [
      {
        Proyecto: "Proyecto A",
        EspacioAcademico: "Matemáticas",
        Grupo: "Grupo 1",
        Horario: "Lunes 10:00 - 12:00",
        EspacioFisico: "Aula 101",
        Seleccionar: "Seleccionar"
      },
      {
        Proyecto: "Proyecto B",
        EspacioAcademico: "Historia",
        Grupo: "Grupo 2",
        Horario: "Martes 14:00 - 16:00",
        EspacioFisico: "Aula 102",
        Seleccionar: "Seleccionar"
      }
    ];
  }





}
