import { Component, OnInit } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../models/diccionario/diccionario';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FORM_GESTION_HORARIO } from './form-gestion-horario';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { ParametrosService } from '../../services/parametros.service';
import { Parametros } from '../../../utils/Parametros';


@Component({
  selector: 'udistrital-gestion-horario',
  templateUrl: './gestion-horario.component.html',
  styleUrl: './gestion-horario.component.scss'
})
export class GestionHorarioComponent {

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
  nivel: any
  planEstudio: any
  proyecto: any
  periodo: any
  semestre: any
  subnivel: any

  banderaGestionGrupos: boolean = false;
  banderaRegistrarHorario: boolean = false;
  banderaCopiarHorario: boolean = false;
  banderaListarHorarios: boolean = false;

  readonly ACTIONS = ACTIONS;
  crear_editar!: Symbol;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private formBuilder: FormBuilder,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private parametros: Parametros,
    ) {
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.updateLanguage();
      })
    }

  ngOnInit() {
    this.vista = VIEWS.LIST;
    this.cargarNiveles();
    this.cargarPeriodos();
    this.cargarSemestres();
    // this.buildFormDisponibilidadCupos();
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

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res
    })
  }

  cargarSemestres() {
    this.parametros.semestres().subscribe((res: any) => {
      this.semestres = res
    })
  }

  // * ----------
  // * Creación de tabla (lista espacios_academicos) 
  //#region
 

  // * ----------
  // * Constructor de formulario, buscar campo, update i18n, suscribirse a cambios
  //#region
  // buildFormDisponibilidadCupos() {
  //   // ? primera carga del formulario: validación e idioma
  //   const form1: { [key: string]: FormControl } = {};
  //   this.formDef.campos_p1.forEach((campo: any) => {
  //     form1[campo.nombre] = new FormControl('', campo.validacion);
  //     campo.label = this.translate.instant(campo.label_i18n);
  //     campo.placeholder = this.translate.instant(campo.placeholder_i18n);
  //   });
  //   this.formStep1 = this.formBuilder.group(form1);

  //   // ? Los campos que requieren ser observados cuando cambian se suscriben
  //   this.formDef.campos_p1.forEach((campo: any) => {
  //     if (campo.entrelazado) {
  //       const formControl = this.formStep1.get(campo.nombre);
  //       if (formControl) {
  //         formControl.valueChanges.subscribe(value => {
  //           this.myOnChanges(campo.nombre, value);
  //         });
  //       }
  //     }  
  //   });
  // }

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

  
  
  // to_gestion_grupo(){
    //   this.bandera_gestion_grupo =true;
    // }
    
    // to_gestion_registo(){
      //   this.bandera_registro_horario =true;
      // }
      
      selectCalendario(event: any) {
        // Código del método aquí...
      }
      
      cambioSuiteGeneral(seleccion: any) {
        this.ocultarSuiteGeneral();
        const banderas:any = {
          gestionGrupos: () => this.banderaGestionGrupos = true,
          registrarHorario: () => this.banderaRegistrarHorario = true,
          copiarHorario: () => this.banderaCopiarHorario = true,
          listarHorarios: () => this.banderaListarHorarios = true
        };
        (banderas[seleccion] || (() => {}))();
      }
      
      ocultarSuiteGeneral(){
        this.banderaGestionGrupos = false
        this.banderaRegistrarHorario = false
        this.banderaCopiarHorario = false
        this.banderaListarHorarios = false
      }
}
