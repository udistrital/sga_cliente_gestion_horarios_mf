import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ParametrosService } from '../../../../services/parametros.service';
import { Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ordenarPorPropiedad } from '../../../../../utils/listas';

@Component({
  selector: 'udistrital-listar-horarios',
  templateUrl: './listar-horarios.component.html',
  styleUrl: './listar-horarios.component.scss'
})
export class ListarHorariosComponent {

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
    this.espaciosAcademicosContructorTabla = [
      { columnDef: 'codigo_espacio_academico', header: this.translate.instant('ptd.codigo_espacio_academico'), cell: (aspirante: any) => aspirante.CodigoEspacioAcademico },
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
        CodigoEspacioAcademico: "1234",
        EspacioAcademico: "Física",
        Grupo: "Grupo 3",
        Horario: "Miércoles 08:00 - 10:00",
        EspacioFisico: "Aula 103",
        Seleccionar: "Seleccionar"
      },
      {
        CodigoEspacioAcademico: "5678",
        EspacioAcademico: "Química",
        Grupo: "Grupo 4",
        Horario: "Jueves 16:00 - 18:00",
        EspacioFisico: "Aula 104",
        Seleccionar: "Seleccionar"
      },
      {
        CodigoEspacioAcademico: "8976",
        EspacioAcademico: "Matemáticas",
        Grupo: "Grupo 1",
        Horario: "Lunes 10:00 - 12:00",
        EspacioFisico: "Aula 101",
        Seleccionar: "Seleccionar"
      },
      {
        CodigoEspacioAcademico: "8976",
        EspacioAcademico: "Historia",
        Grupo: "Grupo 2",
        Horario: "Martes 14:00 - 16:00",
        EspacioFisico: "Aula 102",
        Seleccionar: "Seleccionar"
      }
    ];
  }
  





}
