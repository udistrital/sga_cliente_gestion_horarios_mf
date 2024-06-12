import { Component, OnInit } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../models/diccionario/diccionario';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FORM_GESTION_HORARIO } from './form-gestion-horario';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { ParametrosService } from '../../services/parametros.service';


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
  niveles!: any[];
  proyectos!: any[];
  periodos!: any[] ;
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
    ) {
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.updateLanguage();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formDef = {...FORM_GESTION_HORARIO};
    this.loadSelects();
    this.buildFormDisponibilidadCupos();
  }

  // * ----------
  // * Creación de tabla (lista espacios_academicos) 
  //#region
 

  // * ----------
  // * Constructor de formulario, buscar campo, update i18n, suscribirse a cambios
  //#region
  buildFormDisponibilidadCupos() {
    // ? primera carga del formulario: validación e idioma
    const form1: { [key: string]: FormControl } = {};
    this.formDef.campos_p1.forEach((campo: any) => {
      form1[campo.nombre] = new FormControl('', campo.validacion);
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
    this.formStep1 = this.formBuilder.group(form1);

    // ? Los campos que requieren ser observados cuando cambian se suscriben
    this.formDef.campos_p1.forEach((campo: any) => {
      if (campo.entrelazado) {
        const formControl = this.formStep1.get(campo.nombre);
        if (formControl) {
          formControl.valueChanges.subscribe(value => {
            this.myOnChanges(campo.nombre, value);
          });
        }
      }  
    });
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

  myOnChanges(label: string, field: any) {
    if (label == 'nivel' && field) {
      let idx = this.getIndexOf(this.formDef.campos_p1, 'subnivel');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId && (nivel.NivelFormacionPadreId.Id == field.Id));
      }
      idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = [];
      }
    }
    if (label == 'subnivel' && field) {
      let idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = this.proyectos.filter(proyecto => proyecto.NivelFormacionId && (proyecto.NivelFormacionId.Id == field.Id));
      }
    }

  }




  // * ----------
  // * Carga información paramétrica (selects)
  //#region
  loadNivel(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
        (resp: any) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"nivel": null});
          }
        }, (err) => {
          reject({"nivel": err});
        }
      );
    });
  }

  loadProyectos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
        (resp: any) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"proyecto": null});
          }
        }, (err) => {
          reject({"proyecto": err});
        }
      );
    });
  }


  //#endregion
  // * ----------

  // * ----------
  // * Insertar info parametrica en formulario (en algunos se tiene en cuenta el rol y se pueden omitir) 
  //#region
  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadNivel().then(niveles => {
        this.niveles = niveles;
        let idx = this.formDef.campos_p1.findIndex((campo: any) => campo.nombre == 'nivel')
        if (idx != -1) {
          this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId == undefined);
        }
      }));
      promesas.push(this.loadProyectos().then(proyectos => {this.proyectos = proyectos}));
      await Promise.all(promesas);
      this.loading = false;
    } catch (error: any) {
      console.warn(error);
      this.loading = false;
      const falloEn = Object.keys(error)[0];
    }
      
  }
  //#endregion
  // * ----------

  cargarPeriodo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').subscribe(
        (resp: any) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"periodos": null});
          }
        }, (err) => {
          reject({"periodos": err});
        }
      );
    });
  }

  cambioSeleccion(seleccion: any) {
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

  // to_gestion_grupo(){
  //   this.bandera_gestion_grupo =true;
  // }

  // to_gestion_registo(){
  //   this.bandera_registro_horario =true;
  // }

  selectCalendario(event: any) {
    // Código del método aquí...
  }


}
