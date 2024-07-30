import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Parametros } from '../../../../../utils/Parametros';
import { PopUpManager } from '../../../../managers/popUpManager';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { ordenarPorPropiedad } from '../../../../../utils/listas';
import { PlanTrabajoDocenteMidService } from '../../../../services/plan-trabajo-docente-mid.service';
import { HorarioComponent } from './components/horario/horario.component';
import { MatStepper } from '@angular/material/stepper';
import { selectsPasoDos, selectsPasoUno } from './utilidades';
import { limpiarErroresDeFormulario } from '../../../../../utils/formularios';
import { GestionExistenciaHorarioService } from '../../../../services/gestion-existencia-horario.service';

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
  semestres: any
  //proyecto, horarioSemestreId, periodo
  infoAdicionalColocacion: any

  banderaHorario = false

  constructor(
    private _formBuilder: FormBuilder,
    private horarioMid: HorarioMidService,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private translate: TranslateService,
    private planTrabajoDocenteMid: PlanTrabajoDocenteMidService,
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
      grupoEspacio: ['', Validators.required],
    });
    this.selectsPasoUno = selectsPasoUno
  }

  iniciarFormPaso2() {
    this.formPaso2 = this._formBuilder.group({
      facultad: ['', Validators.required],
      bloque: ['', Validators.required],
      salon: ['', Validators.required],
      horas: ['', [Validators.required, this.horaValidador()]]
    });
    this.selectsPasoDos = selectsPasoDos
    this.cargarInformacionParaPasoDos()
  }

  listarGruposEstudioSegunParametros() {
    const horarioId = this.horario._id
    const semestre = this.formPaso1.get('semestre')?.value;
    this.horarioMid.get("grupo-estudio?horario-id=" + horarioId + "&semestre-id=" + semestre.Id).subscribe((res: any) => {
      if (res.Success) {
        if (res.Data.length > 0) {
          this.gruposEstudio = ordenarPorPropiedad(res.Data, "Nombre", 1)
        } else {
          this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_grupos_registrados"))
          this.limpiarSelectoresDependientes('semestre', this.selectsPasoUno)
        }
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant("GLOBAL.error"))
      }
    })
  }

  listarEspaciosDeGrupoEstudio(grupo: any) {
    this.banderaHorario = false
    this.infoAdicionalColocacion = {
      proyecto: this.dataParametrica.proyecto,
      grupoEstudio: this.formPaso1.get('grupoEstudio')?.value,
      periodo: this.dataParametrica.periodo,
    }
    this.espaciosAcademicos = grupo.EspaciosAcademicos.map((espacio: any) => {
      espacio.Nombre = espacio.nombre + " (" + espacio.grupo + ")";
      return espacio;
    });

    setTimeout(() => {
      this.banderaHorario = true
    },10)
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros.semestresSegunPlanEstudio(planEstudio).subscribe((res: any) => {
      this.semestres = res
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
      this.formPaso1.patchValue({
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
    this.gestionExistenciaHorario.gestionarHorario(this.dataParametrica, this.semestres, this.popUpManager, this.translate, (horario: any) => {
      if (horario) {
        this.horario = horario;
      } else {
        this.volverASelectsParametrizables();
      }
    });
  }

  horaValidador(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const horas = control.value;
      if (horas < 0.5) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_min")};
      }
      if (horas > 8) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_max") + " 8" };
      }
      if (horas % 0.25 !== 0) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_multiplo_0.25")};
      }
      return null;
    };
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
      "Id": 31,
      "Nombre": "2022-1",
      "Descripcion": "Periodo académico 2022-1",
      "Year": 2022,
      "Ciclo": "1",
      "CodigoAbreviacion": "PA",
      "Activo": true,
      "AplicacionId": 41,
      "InicioVigencia": "2022-03-08T00:00:00Z",
      "FinVigencia": "2022-06-30T00:00:00Z",
      "FechaCreacion": "2022-03-11 11:18:15.094268 +0000 +0000",
      "FechaModificacion": "2024-06-21 08:30:12.060977 +0000 +0000"
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
