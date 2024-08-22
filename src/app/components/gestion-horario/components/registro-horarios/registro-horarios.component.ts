import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Parametros } from '../../../../../utils/Parametros';
import { PopUpManager } from '../../../../managers/popUpManager';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { ordenarPorPropiedad } from '../../../../../utils/listas';
import { HorarioComponent } from './components/horario/horario.component';
import { MatStepper } from '@angular/material/stepper';
import { selectsPasoDos, selectsPasoUno } from './utilidades';
import { establecerSelectsSecuenciales, limpiarErroresDeFormulario } from '../../../../../utils/formularios';
import { GestionExistenciaHorarioService } from '../../../../services/gestion-existencia-horario.service';
import { TrabajoDocenteMidService } from '../../../../services/trabajo-docente-mid.service';

@Component({
  selector: 'udistrital-registro-horarios',
  templateUrl: './registro-horarios.component.html',
  styleUrl: './registro-horarios.component.scss'
})
export class RegistroHorariosComponent implements OnInit {

  [key: string]: any; // Permitir el acceso dinámico con string keys

  @ViewChild(HorarioComponent) HorarioComponent!: HorarioComponent;
  @ViewChild('stepper') private stepper!: MatStepper;
  @Input() dataParametrica: any;
  @Output() volverASelects = new EventEmitter<boolean>();

  selectsPasoUno: any
  selectsPasoDos: any

  formPaso1!: FormGroup;
  formPaso2!: FormGroup;

  infoEspacio: any
  bloques: any
  espaciosAcademicos: any
  informacionParaPasoDos: any
  gruposEstudio: any
  horario: any
  facultades: any
  periodos: any
  salones: any
  semestresDePlanEstudio: any
  //proyecto, horarioSemestreId, periodo
  infoAdicionalColocacion: any

  banderaHorario = false
  esEditableHorario = false

  constructor(
    private _formBuilder: FormBuilder,
    private horarioMid: HorarioMidService,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private translate: TranslateService,
    private planTrabajoDocenteMid: TrabajoDocenteMidService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
  ) {
  }

  ngOnInit() {
    this.dataParametrica = datosPrueba()
    this.cargarSemestresSegunPlanEstudio(this.dataParametrica.planEstudio)
    this.iniciarFormularios()
  }

  volverASelectsParametrizables() {
    this.volverASelects.emit(true)
  }

  iniciarFormularios() {
    this.iniciarFormPaso1()
    this.iniciarFormPaso2()
  }

  iniciarFormPaso1() {
    this.formPaso1 = this._formBuilder.group({
      semestre: ['', Validators.required],
      grupoEstudio: ['', Validators.required],
    });
    this.selectsPasoUno = selectsPasoUno
    establecerSelectsSecuenciales(this.formPaso1)
  }

  iniciarFormPaso2() {
    this.formPaso2 = this._formBuilder.group({
      grupoEspacio: ['', Validators.required],
      facultad: ['', Validators.required],
      bloque: ['', Validators.required],
      salon: ['', Validators.required],
      horas: ['', [Validators.required, this.horaValidador()]]
    });
    this.selectsPasoDos = selectsPasoDos
    this.cargarInformacionParaPasoDos()
    establecerSelectsSecuenciales(this.formPaso2, ['facultad', 'bloque', 'salon'] )
  }

  listarGruposEstudioSegunParametros() {
    const horarioId = this.horario._id
    const semestre = this.formPaso1.get('semestre')?.value;
    this.horarioMid.get("grupo-estudio?horario-id=" + horarioId + "&semestre-id=" + semestre.Id).subscribe((res: any) => {
      if (res.Success) {
        if (res.Data.length > 0) {
          this.gruposEstudio = ordenarPorPropiedad(res.Data, "Nombre", 1)
        } else {
          this.gruposEstudio = []
          this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_grupos_registrados"))
          this.limpiarSelectoresDependientes('semestre', this.selectsPasoUno)
        }
      }
    })
  }

  listarEspaciosDeGrupoEstudio(grupo: any) {
    this.banderaHorario = false
    this.infoAdicionalColocacion = {
      proyecto: this.dataParametrica.proyecto,
      grupoEstudio: this.formPaso1.get('grupoEstudio')?.value,
      periodo: this.dataParametrica.periodo,
      actividadesCalendario: this.dataParametrica.actividadesCalendario
    }
    this.espaciosAcademicos = grupo.EspaciosAcademicos.map((espacio: any) => {
      espacio.Nombre = espacio.nombre + " (" + espacio.grupo + ")";
      return espacio;
    });

    setTimeout(() => {
      this.banderaHorario = true
    }, 10)
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros.semestresSegunPlanEstudio(planEstudio).subscribe((res: any) => {
      this.semestresDePlanEstudio = res
      this.consultarExistenciaDeHorario()
    })
  }

  cargarInformacionParaPasoDos() {
    const dependenciaId = this.dataParametrica.proyecto.DependenciaId
    this.planTrabajoDocenteMid.get('espacio-fisico/dependencia?dependencia=' + dependenciaId).subscribe((res: any) => {
      this.informacionParaPasoDos = res.Data
      this.facultades = res.Data.Sedes
      this.limpiarSelectoresDependientes('facultad', this.selectsPasoDos);
    })
  }

  cargarBloquesSegunFacultad(sede: any) {
    const facultadId = sede.Id
    this.bloques = this.informacionParaPasoDos.Edificios[facultadId];
    this.limpiarSelectoresDependientes('bloque', this.selectsPasoDos);
  }

  cargarSalonesSegunBloque(edificio: any) {
    const edificioId = edificio.Id
    this.salones = this.informacionParaPasoDos.Salones[edificioId];
  }

  limpiarSelectoresDependientes(selector: string, form: { name: string; options: string }[]): void {
    // Este método borra los valores seleccionados si se cambia el select anterior
    const index = form.findIndex(s => s.name === selector);
    for (let i = index + 1; i < form.length; i++) {
      this[form[i].options] = [];
    }
  }

  enviarInfoParaColocacion() {
    if (this.formPaso2.invalid) {
      this.formPaso2.markAllAsTouched();
      return;
    }

    this.infoEspacio = {
      ...this.formPaso1.value,
      ...this.formPaso2.value,
    };
    setTimeout(() => {
      this.HorarioComponent.addCarga()
    }, 10)
  }

  nuevoEspacio(evento: boolean) {
    if (evento) {
      this.formPaso2.reset()
      this.stepper.selectedIndex = 1
      //todo: revisar esto:
      limpiarErroresDeFormulario(this.formPaso1);
      limpiarErroresDeFormulario(this.formPaso2);
    }
  }

  consultarExistenciaDeHorario() {
    const proyecto = this.dataParametrica.proyecto;
    const plan = this.dataParametrica.planEstudio;
    const periodo = this.dataParametrica.periodo;
    this.gestionExistenciaHorario.gestionarHorario(proyecto, plan, periodo, this.semestresDePlanEstudio, (horario: any) => {
      if (horario) {
        this.horario = horario;
        this.verificarCalendarioParaGestionHorario()
      } else {
        this.volverASelectsParametrizables();
      }
    });
  }

  horaValidador(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const horas = control.value;
      if (horas < 0.5) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_min") };
      }
      if (horas > 8) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_max") + " 8" };
      }
      if (horas % 0.25 !== 0) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_multiplo_0.25") };
      }
      return null;
    };
  }

  verificarCalendarioParaGestionHorario() {
    const actividadGestionHorario = this.dataParametrica.actividadesCalendario?.actividadesGestionHorario[0]
    if (actividadGestionHorario == null) {
      return this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_definido_proceso_para_horario_calendario"))
    }

    console.log(actividadGestionHorario.DentroFechas)
    if (!actividadGestionHorario.DentroFechas) {
      return this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_dentro_fechas_para_horario"))
    }
    this.esEditableHorario = true
  }
}

export function datosPrueba() {
  return {
    "nivel": {
      "Activo": true,
      "CodigoAbreviacion": "POS",
      "Descripcion": "Posgrado",
      "FechaCreacion": "2019-11-15 00:43:28.591057 +0000 +0000",
      "FechaModificacion": "2019-11-15 00:43:28.591057 +0000 +0000",
      "Id": 2,
      "NivelFormacionPadreId": null,
      "Nombre": "Posgrado",
      "NumeroOrden": 2
    },
    "periodo": {
      "Activo": true,
      "AplicacionId": 41,
      "Ciclo": "1",
      "CodigoAbreviacion": "PA",
      "Descripcion": "Periodo académico 2022-1",
      "FechaCreacion": "2022-03-11 11:18:15.094268 +0000 +0000",
      "FechaModificacion": "2024-06-21 08:30:12.060977 +0000 +0000",
      "FinVigencia": "2022-06-30T00:00:00Z",
      "Id": 31,
      "InicioVigencia": "2022-03-08T00:00:00Z",
      "Nombre": "2022-1",
      "Year": 2022
    },
    "planEstudio": {
      "Activo": true,
      "AnoResolucion": 2021,
      "Codigo": "123",
      "CodigoAbreaviacion": "",
      "EsPlanEstudioPadre": false,
      "EspaciosSemestreDistribucion": "{\"semestre_1\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"64935cac85308dfabd19a938\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}}]},\"semestre_2\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"64935cf285308d74f119a93c\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}},{\"espacio_2\":{\"Id\":\"64935d4d85308d4a7019a940\",\"OrdenTabla\":2,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}}]}}",
      "EstadoAprobacionId": {
        "Id": 2,
        "Nombre": "Por Revisar",
        "Descripcion": "Por Revisar",
        "CodigoAbreviacion": "REV",
        "Activo": true
      },
      "FechaCreacion": "2023-08-25 11:05:51.30267 +0000 +0000",
      "FechaModificacion": "2023-11-07 20:42:49.05516 +0000 +0000",
      "Id": 1,
      "Nombre": "Plan de estudio Prueba",
      "NumeroResolucion": 123,
      "NumeroSemestres": 8,
      "Observacion": "",
      "ProyectoAcademicoId": 31,
      "ResumenPlanEstudios": "{\"nombre\":\"TOTAL\",\"creditos\":8,\"htd\":144,\"htc\":96,\"hta\":144,\"OB\":0,\"OC\":0,\"EI\":0,\"EE\":0,\"CP\":0,\"ENFQ_TEO\":3,\"ENFQ_PRAC\":0,\"ENFQ_TEOPRAC\":0,\"numero_semestres\":2}",
      "RevisorId": 0,
      "RevisorRol": "",
      "SoporteDocumental": "{\"SoporteDocumental\":[150561,150562]}",
      "TotalCreditos": 164
    },
    "proyecto": {
      "Activo": true,
      "AnoActoAdministrativo": "2020",
      "AreaConocimientoId": 7,
      "CiclosPropedeuticos": false,
      "Codigo": "125",
      "CodigoAbreviacion": "MAESINGINDUS",
      "CodigoSnies": "234567",
      "Competencias": "Maestria en Ingenieria Industrial",
      "CorreoElectronico": "maestriaingindust@correo.com",
      "DependenciaId": 30,
      "Duracion": 10,
      "EnlaceActoAdministrativo": "2493",
      "FacultadId": 14,
      "FechaCreacion": "2021-08-04 20:48:47.852479 +0000 +0000",
      "FechaModificacion": "2023-06-21 15:19:08.690044 +0000 +0000",
      "Id": 31,
      "MetodologiaId": {
        "Id": 1,
        "Nombre": "Presencial",
        "Descripcion": "Presencial",
        "CodigoAbreviacion": "PRE",
        "Activo": true
      },
      "ModalidadId": null,
      "NivelFormacionId": {
        "Id": 7,
        "Nombre": "Maestria",
        "Descripcion": "maestria",
        "CodigoAbreviacion": "MAS",
        "Activo": true
      },
      "Nombre": "Maestría en Ingeniería Industrial",
      "NucleoBaseId": 9,
      "NumeroActoAdministrativo": 123,
      "NumeroCreditos": 60,
      "Oferta": true,
      "ProyectoPadreId": null,
      "UnidadTiempoId": 6
    },
    "semestre": {
      "Activo": true,
      "CodigoAbreviacion": "1ERS",
      "Descripcion": "Primer semestre",
      "FechaCreacion": "2024-06-18 14:49:57.465242 +0000 +0000",
      "FechaModificacion": "2024-06-18 14:54:18.418942 +0000 +0000",
      "Id": 6507,
      "Nombre": "Primer semestre",
      "NumeroOrden": 1,
      "ParametroPadreId": null,
      "TipoParametroId": {
        "Id": 107,
        "Nombre": "Semestre académico",
        "Descripcion": "Semestre académico",
        "CodigoAbreviacion": "SA",
        "Activo": true
      }
    },
    "subnivel": {
      "Activo": true,
      "CodigoAbreviacion": "MAS",
      "Descripcion": "maestria",
      "FechaCreacion": "2021-01-05 17:14:35.50068 +0000 +0000",
      "FechaModificacion": "2021-01-05 17:14:35.50068 +0000 +0000",
      "Id": 7,
      "NivelFormacionPadreId": {
        "Id": 2,
        "Nombre": "Posgrado",
        "Descripcion": "Posgrado",
        "CodigoAbreviacion": "POS",
        "Activo": true
      },
      "Nombre": "Maestria",
      "NumeroOrden": 7
    },
    "actividadesCalendario": {
      "actividadesGestionHorario": [
        {
          "DentroFechas": true,
          "FechaFin": "2024-08-31T00:00:00Z",
          "FechaInicio": "2024-08-01T00:00:00Z",
          "Id": 296,
          "Nombre": "Producción de horarios"
        }
      ],
      "actividadesGestionPlanDocente": [
        {
          "DentroFechas": true,
          "FechaFin": "2024-08-31T00:00:00Z",
          "FechaInicio": "2024-08-01T00:00:00Z",
          "Id": 295,
          "Nombre": "Plan de trabajo docente"
        }
      ]
    }
  }

}