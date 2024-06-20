import { Component, OnInit, ViewChild } from '@angular/core';
import { ACTIONS, VIEWS } from '../../models/diccionario/diccionario';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Parametros } from '../../../utils/Parametros';
import { selectsParametrizados } from './utilidades';

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
  planesEstudios!: any;
  proyectos!: any;
  periodos: any;
  semestres!: any;
  subniveles!: any;
  //Valores seleccionados de los select parametricos
  selectsParametrizados:any

  readonly ACTIONS = ACTIONS;
  crear_editar!: Symbol;
  [key: string]: any;
  
  constructor(
    private translate: TranslateService,
    private parametros: Parametros,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.iniciarFormularioConsulta()
    this.vista = VIEWS.LIST;
    this.cargarNiveles();
    this.cargarPeriodos();
    this.selectsParametrizados = selectsParametrizados
  }

  cargarNiveles() {
    this.parametros.niveles().subscribe((res: any) => {
      this.niveles = res
    })
  }

  cargarSubnivelesSegunNivel(nivel: any) {
    this.parametros.subnivelesSegunNivel(nivel).subscribe((res: any) => {
      this.subniveles = res
    })
  }

  cargarProyectosSegunSubnivel(subnivel: any) {
    this.parametros.proyectosSegunSubnivel(subnivel).subscribe((res: any) => {
      this.proyectos = res
    })
  }
  
  cargarPlanesEstudioSegunProyectoCurricular(proyecto:any){
    this.parametros.planesEstudioSegunProyectoCurricular(proyecto).subscribe((res: any) => {
      this.planesEstudios = res
    })
  }
  
  cargarSemestresSegunPlanEstudio(planEstudio:any) {
    this.parametros.semestresSegunPlanEstudio(planEstudio).subscribe((res: any) => {
      this.semestres = res
    })
  }
  
    cargarPeriodos() {
      this.parametros.periodos().subscribe((res: any) => {
        this.periodos = res
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


  iniciarFormularioConsulta(){
    this.formStep1 = this.fb.group({
      nivel: ['', Validators.required],
      subnivel: ['', Validators.required],
      proyecto: ['', Validators.required],
      planEstudio: ['', Validators.required],
      semestre: ['', Validators.required],
      periodo: ['', Validators.required]
    });
  }
}
