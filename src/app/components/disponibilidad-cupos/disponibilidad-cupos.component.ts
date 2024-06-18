import { Component, OnInit, ViewChild } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../models/diccionario/diccionario';
// import { LocalDataSource } from 'ng2-smart-table';
import { HttpErrorResponse } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../theme/ng2-st-button/ng2-st-button.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FORM_DISPONIBILIDAD_CUPOS } from './form-disponibilidad-cupos';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { ParametrosService } from '../../services/parametros.service';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ordenarPorPropiedad } from '../../../utils/listas';

@Component({
  selector: 'udistrital-disponibilidad-cupos',
  templateUrl: './disponibilidad-cupos.component.html',
  styleUrl: './disponibilidad-cupos.component.scss'
})
export class DisponibilidadCuposComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['index', 'nombre', 'codigo', 'estado', 'grupo', 'cupos', 'inscritos', 'disponibles', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  loading!: boolean;

  readonly VIEWS = VIEWS;
  vista!: Symbol;

  tbDiponibilidadHorarios!: Object;

  formStep1!: FormGroup;
  formDef: any;
  //Listas para los select parametricos
  niveles!: any;
  proyectos!: any;
  periodos: any;
  semestres!: any;
  subniveles!: any;
  //Valores seleccionados de los select parametricos
  nivel: any
  proyecto: any
  periodo: any
  semestre: any
  subnivel: any

  readonly ACTIONS = ACTIONS;
  crear_editar!: Symbol;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
  ) {
  }

  ngOnInit() {
    this.vista = VIEWS.LIST;
    this.cargarNiveles();
    this.cargarPeriodo();
    this.dataSource = new MatTableDataSource<any>(this.tbDiponibilidadHorarios as any[]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarNiveles() {
    this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
      (res: any) => {
        if (!(res.length > 0)) {
          return;
        }
        this.niveles = res.filter((nivel: any) => nivel.NivelFormacionPadreId == undefined)
      });
  }

  filtrarSubniveles(nivel: any) {
    this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
      (res: any) => {
        if (!(res.length > 0)) {
          return;
        }
        this.subniveles = res.filter((subnivel: any) => {
          return subnivel.NivelFormacionPadreId && subnivel.NivelFormacionPadreId.Id == nivel.Id;
        });
      });
  }

  filtrarProyectos(subnivel: any) {
    this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
      (res: any) => {
        if (!(res.length > 0)) {
          return;
        }
        this.proyectos = res.filter((proyecto: any) => {
          return proyecto.NivelFormacionId && proyecto.NivelFormacionId.Id == subnivel.Id;
        })
      });
  }

  cargarPeriodo() {
    this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
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
      })
  }

  getIndexOf(campos: any[], label: string): number {
    return campos.findIndex(campo => campo.nombre == label);
  }

  updateLanguage() {
    this.reloadLabels(this.formDef.campos_p1);
  }

  reloadLabels(campos: any[]) {
    campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  // myOnChanges(label: string, field: any) {
  //   if (label == 'nivel' && field) {
  //     let idx = this.getIndexOf(this.formDef.campos_p1, 'subnivel');
  //     if (idx != -1) {
  //       this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId && (nivel.NivelFormacionPadreId.Id == field.Id));
  //     }
  //     idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
  //     if (idx != -1) {
  //       this.formDef.campos_p1[idx].opciones = [];
  //     }
  //   }
  //   if (label == 'subnivel' && field) {
  //     let idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
  //     if (idx != -1) {
  //       this.formDef.campos_p1[idx].opciones = this.proyectos.filter(proyecto => proyecto.NivelFormacionId && (proyecto.NivelFormacionId.Id == field.Id));
  //     }
  //   }

  // }

  editElement(element: any) {
    // Lógica para editar un elemento
  }

  deleteElement(element: any) {
    // Lógica para eliminar un elemento
  }

}
