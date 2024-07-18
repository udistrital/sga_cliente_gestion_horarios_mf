import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ProyectoAcademicoService } from '../../../../services/proyecto_academico.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametros } from '../../../../../utils/Parametros';
import { PopUpManager } from '../../../../managers/popUpManager';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { ordenarPorPropiedad } from '../../../../../utils/listas';
import { OikosService } from '../../../../services/oikos.service';
import { PlanTrabajoDocenteMidService } from '../../../../services/plan-trabajo-docente-mid.service';
import { HorarioComponent } from './components/horario/horario.component';
import { MatStepper } from '@angular/material/stepper';
import { selectsPasoDos, selectsPasoUno } from './utilidades';
import { limpiarErroresDeFormulario } from '../../../../../utils/formularios';
import { HorarioService } from '../../../../services/horario.service';

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
  horarioPadre: any
  horarioHijo: any
  facultades: any
  periodos: any
  salones: any
  semestres: any

  banderaHorario = false

  constructor(
    private _formBuilder: FormBuilder,
    private horarioMid: HorarioMidService,
    private horarioService: HorarioService,
    private translate: TranslateService,
    private planTrabajoDocenteMid: PlanTrabajoDocenteMidService,
    private projectService: ProyectoAcademicoService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private oikosService: OikosService,
  ) {
  }

  ngOnInit() {
    this.dataParametrica = datosPrueba()
    this.cargarSemestresSegunPlanEstudio(this.dataParametrica.planEstudio)
    this.iniciarFormularios()
    this.consultarExistenciaDeHorario()
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
      grupoEspacio: ['', Validators.required],
    });
    this.selectsPasoUno = selectsPasoUno
  }

  iniciarFormPaso2() {
    this.formPaso2 = this._formBuilder.group({
      facultad: ['', Validators.required],
      bloque: ['', Validators.required],
      salon: ['', Validators.required],
      horas: ['', [Validators.required, Validators.min(0.5), Validators.max(8)]]
    });
    this.selectsPasoDos = selectsPasoDos
    this.cargarInformacionParaPasoDos()
  }

  listarGruposEstudioSegunParametros() {
    const proyectoId = this.dataParametrica.proyecto.Id
    const planEstudioId = this.dataParametrica.planEstudio.Id
    const semestre = this.formPaso1.get('semestre')?.value
    const query = `proyecto-academico=${proyectoId}&plan-estudios=${planEstudioId}&semestre=${semestre.Id}&limit=0`;

    this.horarioMid.get(`grupo-estudio?${query}`).subscribe((res: any) => {
      if (res.Success) {
        if (res.Data.length > 0) {
          this.gruposEstudio = ordenarPorPropiedad(res.Data, "Nombre", 1)
        } else {
          this.popUpManager.showAlert("", this.translate.instant("GLOBAL.no_informacion_registrada"))
        }
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant("GLOBAL.error"))
      }
    })
  }

  listarEspaciosDeGrupo(grupo: any) {
    this.espaciosAcademicos = grupo.EspaciosAcademicos.map((espacio: any) => {
      espacio.Nombre = espacio.nombre + " (" + espacio.grupo + ")";
      return espacio;
    });
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros.semestresSegunPlanEstudio(planEstudio).subscribe((res: any) => {
      this.semestres = res
    })
  }

  cargarInformacionParaPasoDos() {
    const dependenciaId = this.dataParametrica.proyecto.DependenciaId
    this.planTrabajoDocenteMid.get('espacio-fisico/dependencia?dependencia=' + dependenciaId).subscribe((res: any) => {
      this.informacionParaPasoDos = res.Data
      this.facultades = res.Data.Sedes
      this.limpiarSelectoresDependientes('facultad');
    })
  }

  cargarBloquesSegunFacultad(sede: any) {
    const facultadId = sede.Id
    this.bloques = this.informacionParaPasoDos.Edificios[facultadId];
    this.limpiarSelectoresDependientes('bloque');
  }

  cargarSalonesSegunBloque(edificio: any) {
    const edificioId = edificio.Id
    this.salones = this.informacionParaPasoDos.Salones[edificioId];
  }

  limpiarSelectoresDependientes(selector: string) {
    //este metodo borra los valores seleccionados, si se cambia el select anterior
    const index = selectsPasoDos.findIndex(s => s.name === selector);
    for (let i = index + 1; i < selectsPasoDos.length; i++) {
      this[selectsPasoDos[i].options] = [];
    }
  }

  enviarInfoParaHorario() {
    this.infoEspacio = {
      ...this.formPaso1.value,
      ...this.formPaso2.value,
      proyecto: this.dataParametrica.proyecto,
      horario: this.horarioHijo
    };
    setTimeout(() => {
      this.HorarioComponent.addCarga()
    }, 10)
    this.banderaHorario = true
  }

  nuevoEspacio(evento: boolean) {
    if (evento) {
      this.formPaso1.patchValue({
        grupoEstudio: "",
        grupoEspacio: ""
      })
      this.formPaso2.reset()
      this.stepper.selectedIndex = 0
      //todo: revisar esto:
      limpiarErroresDeFormulario(this.formPaso1);
      limpiarErroresDeFormulario(this.formPaso2);
    }
  }

  consultarExistenciaDeHorario() {
    const proyectoId = this.dataParametrica.proyecto.Id
    const planId = this.dataParametrica.planEstudio.Id
    const periodo = this.dataParametrica.periodo

    const query = "horario?query=ProyectoAcademicoId:" + proyectoId + ",PlanEstudioId:" + planId + ",PeriodoId:" + periodo.Id + ",Activo:true"
    this.horarioService.get(query).subscribe((res: any) => {
      if (res.Success && res.Data.length > 0) {
        this.horarioPadre = res.Data[0]
      } else {
        this.popUpManager.showConfirmAlert(this.translate.instant("gestion_horarios.desea_crear_horario_descripcion") + periodo.Nombre,
          this.translate.instant("gestion_horarios.desea_crear_horario")).then(confirmado => {
            if (confirmado.value) {
              this.guardarHorario()
            } else {
              this.volverASelectsParametrizables()
            }
          })
      }
    })
  }

  consultarExistenciaDeHorarioSemestre() {
    const horarioId = this.horarioPadre._id
    const semestre = this.formPaso1.get('semestre')?.value

    const query = "horario-semestre?query=HorarioId:" + horarioId + ",SemestreId:" + semestre.Id + ",Activo:true"
    this.horarioService.get(query).subscribe((res: any) => {
      if (res.Success && res.Data.length > 0) {
        this.horarioHijo = res.Data[0]
        this.listarGruposEstudioSegunParametros()
      } else {
        this.popUpManager.showConfirmAlert(this.translate.instant("gestion_horarios.desea_crear_horario_semestre_descripcion") + ": " + semestre.Nombre,
          this.translate.instant("gestion_horarios.desea_crear_horario_semestre")).then(confirmado => {
            if (confirmado.value) {
              this.guardarHorarioSemestre()
            } else {
              this.formPaso1.patchValue({
                semestre: null
              });
            }
          })
      }
    })
  }

  guardarHorario() {
    const horario = this.construirObjetoHorario()
    this.horarioService.post("horario", horario).subscribe((res: any) => {
      if (res.Success) {
        this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.horario_creado_satisfactoriamente"))
      } else {
        this.popUpManager.showAlert("", this.translate.instant("GLOBAL.error"))
        this.volverASelectsParametrizables()
      }
    })
  }

  guardarHorarioSemestre() {
    const horarioSemestre = this.construirObjetoHorarioSemestre()
    this.horarioService.post("horario-semestre", horarioSemestre).subscribe((res: any) => {
      if (res.Success) {
        this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.horario_creado_satisfactoriamente"))
        this.listarGruposEstudioSegunParametros()
      }
    })
  }

  construirObjetoHorario() {
    const nombreHorario = "Horario del " + this.dataParametrica.proyecto.Nombre + " del plan " + this.dataParametrica.planEstudio.Nombre + " periodo " + this.dataParametrica.periodo.Nombre
    const codigoAbreviacion = "Horario-" + this.dataParametrica.proyecto.Nombre + "-" + this.dataParametrica.planEstudio.Nombre + "-" + this.dataParametrica.periodo.Nombre
    //Todo: cambiar parametros
    const horario = {
      Nombre: nombreHorario,
      CodigoAbreviacion: codigoAbreviacion,
      //todo: cambiar
      Codigo: "Vacio",
      ProyectoAcademicoId: this.dataParametrica.proyecto.Id,
      PlanEstudioId: this.dataParametrica.planEstudio.Id,
      PeriodoId: this.dataParametrica.periodo.Id,
      //todo: cambiar
      EstadoCreacionId: "6697296a48a7c6ead8eea153",
      Observacion: "Vacio",
      Activo: true,
    }
    return horario
  }

  construirObjetoHorarioSemestre() {
    const semestre = this.formPaso1.get('semestre')?.value
    const nombreHorario = this.horarioPadre.Nombre + " " + semestre.Nombre
    const codigoAbreviacion = this.horarioPadre.CodigoAbreviacion + "-" + semestre.Nombre
    //Todo: cambiar parametros
    const horarioSemestre = {
      Nombre: nombreHorario,
      CodigoAbreviacion: codigoAbreviacion,
      SemestreId: semestre.Id,
      PeriodoId: this.dataParametrica.periodo.Id,
      HorarioId: this.horarioPadre._id,
      //todo: cambiar
      EstadoCreacionSemestreId: "6697296a48a7c6ead8eea153",
      //todo: cambiar
      Observacion: "Vacio",
      Activo: true,
    }
    return horarioSemestre
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
      "Activo": false,
      "AplicacionId": 41,
      "Ciclo": "2",
      "CodigoAbreviacion": "PA",
      "Descripcion": "Periodo académico 2024-2",
      "FechaCreacion": "2024-05-17 12:34:48.502181 +0000 +0000",
      "FechaModificacion": "2024-06-10 20:49:05.879567 +0000 +0000",
      "FinVigencia": "2024-05-24T00:00:00Z",
      "Id": 56,
      "InicioVigencia": "2024-05-15T00:00:00Z",
      "Nombre": "2024-2",
      "Year": 2024
    },
    "planEstudio": {
      "Activo": true,
      "AnoResolucion": 2023,
      "Codigo": "sdsd",
      "CodigoAbreaviacion": "",
      "EsPlanEstudioPadre": false,
      "EspaciosSemestreDistribucion": "{\"semestre_1\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"647a1bbe85308d61ca199cda\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":[\"6478c0d485308d4b79199bcd\"]}}},{\"espacio_2\":{\"Id\":\"647a22b485308d82e4199d01\",\"OrdenTabla\":2,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}},{\"espacio_3\":{\"Id\":\"647cc37385308dfbf9199f96\",\"OrdenTabla\":3,\"EspaciosRequeridos\":{\"Id\":[\"6478c10985308d236b199bd2\"]}}}]},\"semestre_2\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"647a1f0d85308d1403199cf4\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":[\"647a1bbe85308d61ca199cda\"]}}},{\"espacio_2\":{\"Id\":\"6532d6fe432effe177e28735\",\"OrdenTabla\":2,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}}]}}",
      "EstadoAprobacionId": {
        "Id": 1,
        "Nombre": "En Edición",
        "Descripcion": "En edición",
        "CodigoAbreviacion": "ED",
        "Activo": true
      },
      "FechaCreacion": "2024-02-18 10:11:39.955115 +0000 +0000",
      "FechaModificacion": "2024-02-18 10:15:27.84161 +0000 +0000",
      "Id": 14,
      "Nombre": "adsd",
      "NumeroResolucion": 223,
      "NumeroSemestres": 2,
      "Observacion": "",
      "ProyectoAcademicoId": 30,
      "ResumenPlanEstudios": "{\"nombre\":\"TOTAL\",\"creditos\":8,\"htd\":132,\"htc\":120,\"hta\":132,\"OB\":3,\"OC\":0,\"EI\":0,\"EE\":0,\"CP\":0,\"ENFQ_TEO\":4,\"ENFQ_PRAC\":0,\"ENFQ_TEOPRAC\":1,\"numero_semestres\":2}",
      "RevisorId": 0,
      "RevisorRol": "",
      "SoporteDocumental": "{\"SoporteDocumental\":[151599]}",
      "TotalCreditos": 122
    },
    "proyecto": {
      "Activo": true,
      "AnoActoAdministrativo": "2020",
      "AreaConocimientoId": 3,
      "CiclosPropedeuticos": false,
      "Codigo": "125",
      "CodigoAbreviacion": "DOCINTEREDU",
      "CodigoSnies": "34567",
      "Competencias": "Doctorado interinstitucional en educación",
      "CorreoElectronico": "docinterinsedu@correo.com",
      "DependenciaId": 30,
      "Duracion": 10,
      "EnlaceActoAdministrativo": "2491",
      "FacultadId": 17,
      "FechaCreacion": "2021-08-04 20:46:10.661809 +0000 +0000",
      "FechaModificacion": "2024-05-02 22:20:35.872675 +0000 +0000",
      "Id": 30,
      "MetodologiaId": {
        "Id": 1,
        "Nombre": "Presencial",
        "Descripcion": "Presencial",
        "CodigoAbreviacion": "PRE",
        "Activo": true
      },
      "ModalidadId": null,
      "NivelFormacionId": {
        "Id": 8,
        "Nombre": "Doctorado",
        "Descripcion": "doctorado",
        "CodigoAbreviacion": "DOC",
        "Activo": true
      },
      "Nombre": "Doctorado interinstitucional en educación",
      "NucleoBaseId": 9,
      "NumeroActoAdministrativo": 123,
      "NumeroCreditos": 60,
      "Oferta": true,
      "ProyectoPadreId": null,
      "UnidadTiempoId": 6
    },
    "subnivel": {
      "Activo": true,
      "CodigoAbreviacion": "DOC",
      "Descripcion": "doctorado",
      "FechaCreacion": "2021-01-05 17:14:35.503167 +0000 +0000",
      "FechaModificacion": "2021-01-05 17:14:35.503167 +0000 +0000",
      "Id": 8,
      "NivelFormacionPadreId": {
        "Id": 2,
        "Nombre": "Posgrado",
        "Descripcion": "Posgrado",
        "CodigoAbreviacion": "POS",
        "Activo": true
      },
      "Nombre": "Doctorado",
      "NumeroOrden": 8
    }
  }

}
