import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Parametros } from '../../../../../utils/Parametros';
import { GestionExistenciaHorarioService } from '../../../../services/gestion-existencia-horario.service';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { PopUpManager } from '../../../../managers/popUpManager';
import { selectsParaConsulta } from './utilidades';
// import { establecerSelectsSecuenciales } from '../../../../../utils/formularios';
import { GestionDocenteService } from '../../../../services/gestion-docente.service';

@Component({
  selector: 'udistrital-listar-horarios',
  templateUrl: './listar-horarios.component.html',
  styleUrl: './listar-horarios.component.scss',
})
export class ListarHorariosComponent implements OnInit {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() dataParametrica: any;
  @Output() volverASelects = new EventEmitter<boolean>();

  docentesDeEspacio: any[] = [];
  espaciosAcademicosDeGrupoEstudio: any;
  formParaConsulta!: FormGroup;
  horario: any;
  gruposEstudio: any;
  semestresDePlanEstudio: any;
  selectsParaConsulta: any;
  colocaciones: any[] = [];

  banderaListaColocaciones: boolean = false;

  constructor(
    private horarioMid: HorarioMidService,
    private gestionDocente: GestionDocenteService,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private fb: FormBuilder,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    //this.dataParametrica = datosPrueba();
    this.iniciarFormularioConsulta();
    this.cargarSemestresSegunPlanEstudio(this.dataParametrica.planEstudio);
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros
      .semestresSegunPlanEstudio(planEstudio)
      .subscribe((res: any) => {
        this.semestresDePlanEstudio = res;
        this.consultarExistenciaDeHorario();
      });
  }

  consultarExistenciaDeHorario() {
    const proyecto = this.dataParametrica.proyecto;
    const plan = this.dataParametrica.planEstudio;
    const periodo = this.dataParametrica.periodo;
    this.gestionExistenciaHorario.gestionarHorario(
      proyecto,
      plan,
      periodo,
      this.semestresDePlanEstudio,
      (horario: any) => {
        if (horario) {
          this.horario = horario;
        } else {
          this.volverASelectsParametrizables();
        }
      }
    );
  }

  listarGruposEstudioSegunParametros() {
    const horarioId = this.horario._id;
    const semestre = this.formParaConsulta.get('semestre')?.value;
    this.horarioMid
      .get(
        'grupo-estudio?horario-id=' + horarioId + '&semestre-id=' + semestre.Id
      )
      .subscribe((res: any) => {
        if (res.Success) {
          if (res.Data.length > 0) {
            this.gruposEstudio = res.Data;
            this.dataParametrica.semestre =
              this.formParaConsulta.get('semestre')?.value;
            this.cargarTodosLosEspacios(this.gruposEstudio);
          } else {
            this.gruposEstudio = [];
            this.popUpManager.showAlert(
              '',
              this.translate.instant('gestion_horarios.no_grupos_registrados')
            );
          }
        }
      });
  }

  cargarDocentesDeEspacio(espacioAcademico: any) {
    if (!this.formParaConsulta.get('grupoEstudio')?.value && espacioAcademico.grupoReal) {
      this.formParaConsulta.get('grupoEstudio')?.setValue(espacioAcademico.grupoReal, { emitEvent: false });
    }

    this.gestionDocente
      .obtenerDocentesDeEspacioAcademico(espacioAcademico)
      .subscribe((res: any) => {
        this.docentesDeEspacio = res;
      });
  }

  buscarColocacionesPorParametros() {
    this.banderaListaColocaciones = false;
    const semestre = this.formParaConsulta.get('semestre')?.value;
    const grupoEstudio = this.formParaConsulta.get('grupoEstudio')?.value;
    const espacioAcademico =
      this.formParaConsulta.get('espacioAcademico')?.value;
    const docente = this.formParaConsulta.get('docente')?.value;

    if (!semestre && !grupoEstudio && !espacioAcademico && !docente) {
      this.cargarColocacionesDeHorario();
    } else if (semestre && !grupoEstudio && !espacioAcademico && !docente) {
      this.cargarColocacionesDeHorarioYSemestre();
    } else if (semestre && grupoEstudio && !espacioAcademico && !docente) {
      this.cargarColocacionesDeGrupoEstudio();
    } else if (semestre && grupoEstudio && espacioAcademico && !docente) {
      this.cargarColocacionesDeEspacioAcademico();
    } else if (semestre && grupoEstudio && espacioAcademico && docente) {
      this.cargarColocacionesDeEspacioAcademicoYDocente();
    } else if (semestre && !grupoEstudio && espacioAcademico && !docente) {
      this.cargarColocacionesDeEspacioAcademicoSinGrupo(false);
    } else if (semestre && !grupoEstudio && espacioAcademico && docente) {
      this.cargarColocacionesDeEspacioAcademicoSinGrupo(true);
    }
  }

  cargarColocacionesDeHorario() {
    this.colocaciones = [];
    const horarioId = this.horario._id;
    const periodoId = this.dataParametrica.periodo.Id;
    this.horarioMid
      .get(
        `colocacion-espacio-academico?horario-id=${horarioId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (res.Data && res.Data.length > 0) {
          res.Data.forEach((colocacion: any) => {
            const colocacionFiltrada =
              this.construirObjetoColocacion(colocacion);
            this.colocaciones.push(colocacionFiltrada);
          });
        }
        this.mostrarListaColocaciones();
      });
  }

  cargarColocacionesDeHorarioYSemestre() {
    this.colocaciones = [];
    const horarioId = this.horario._id;
    const semestreId = this.formParaConsulta.get('semestre')?.value.Id;
    const periodoId = this.dataParametrica.periodo.Id;
    this.horarioMid
      .get(
        `colocacion-espacio-academico?horario-id=${horarioId}&semestre-id=${semestreId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (res.Data && res.Data.length > 0) {
          res.Data.forEach((colocacion: any) => {
            const colocacionFiltrada =
              this.construirObjetoColocacion(colocacion);
            this.colocaciones.push(colocacionFiltrada);
          });
        }
        this.mostrarListaColocaciones();
      });
  }

  cargarColocacionesDeGrupoEstudio() {
    const grupoEstudio = this.formParaConsulta.get('grupoEstudio')?.value;
    const grupoEstudioId = grupoEstudio._id;
    const periodoId = this.dataParametrica.periodo.Id;
    this.colocaciones = [];
    this.horarioMid
      .get(
        `colocacion-espacio-academico?grupo-estudio-id=${grupoEstudioId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (res.Data && res.Data.length > 0) {
          const nomGrupoParsed = grupoEstudio.Nombre ? grupoEstudio.Nombre.replace(/grupo\s*/i, '').trim() : '';

          res.Data.forEach((colocacion: any) => {
            let isValid = true;

            // Verificamos que no se filtren colocaciones de otros grupos (ej. si se trae del grupo 82 habiendo consultado el 81)
            if (nomGrupoParsed && colocacion.EspacioAcademico && colocacion.EspacioAcademico.grupo) {
              if (
                colocacion.EspacioAcademico.grupo !== nomGrupoParsed &&
                !grupoEstudio.Nombre.includes(colocacion.EspacioAcademico.grupo)
              ) {
                isValid = false;
              }
            }

            if (isValid) {
              const colocacionFiltrada = this.construirObjetoColocacion(colocacion);
              this.colocaciones.push(colocacionFiltrada);
            }
          });
        }
        this.mostrarListaColocaciones();
      });
  }

  cargarColocacionesDeEspacioAcademico() {
    this.colocaciones = [];
    const grupoEstudioId = this.formParaConsulta.get('grupoEstudio')?.value._id;
    const periodoId = this.dataParametrica.periodo.Id;
    const espacioAcademicoId =
      this.formParaConsulta.get('espacioAcademico')?.value._id;
    this.horarioMid
      .get(
        `colocacion-espacio-academico?grupo-estudio-id=${grupoEstudioId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (res.Data && res.Data.length > 0) {
          res.Data.forEach((colocacion: any) => {
            if (colocacion.EspacioAcademicoId == espacioAcademicoId) {
              const colocacionFiltrada =
                this.construirObjetoColocacion(colocacion);
              this.colocaciones.push(colocacionFiltrada);
            }
          });
        }
        this.mostrarListaColocaciones();
      });
  }

  cargarColocacionesDeEspacioAcademicoYDocente() {
    this.colocaciones = [];
    const grupoEstudioId = this.formParaConsulta.get('grupoEstudio')?.value._id;
    const periodoId = this.dataParametrica.periodo.Id;
    const espacioAcademicoId =
      this.formParaConsulta.get('espacioAcademico')?.value._id;
    const docenteId = this.formParaConsulta.get('docente')?.value.Id;
    this.horarioMid
      .get(
        `colocacion-espacio-academico?grupo-estudio-id=${grupoEstudioId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (res.Data && res.Data.length > 0) {
          res.Data.forEach((colocacion: any) => {
            if (colocacion.EspacioAcademicoId == espacioAcademicoId) {
              if (colocacion.Docente?.Id == docenteId) {
                const colocacionFiltrada =
                  this.construirObjetoColocacion(colocacion);
                this.colocaciones.push(colocacionFiltrada);
              }
            }
          });
        }
        this.mostrarListaColocaciones();
      });
  }

  cargarColocacionesDeEspacioAcademicoSinGrupo(conDocente: boolean) {
    this.colocaciones = [];
    const horarioId = this.horario._id;
    const semestreId = this.formParaConsulta.get('semestre')?.value.Id;
    const periodoId = this.dataParametrica.periodo.Id;
    const espacioAcademicoPadre = this.formParaConsulta.get('espacioAcademico')?.value.espacio_academico_padre;
    const docenteId = this.formParaConsulta.get('docente')?.value?.Id;

    let idsPermitidos: string[] = [];
    if (this.gruposEstudio) {
      this.gruposEstudio.forEach((g: any) => {
        g.EspaciosAcademicos?.activos?.forEach((e: any) => {
          if (e.espacio_academico_padre === espacioAcademicoPadre) {
            idsPermitidos.push(e._id);
          }
        });
      });
    }

    this.horarioMid
      .get(
        `colocacion-espacio-academico?horario-id=${horarioId}&semestre-id=${semestreId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (res.Data && res.Data.length > 0) {
          res.Data.forEach((colocacion: any) => {
            if (idsPermitidos.includes(colocacion.EspacioAcademicoId)) {
              if (conDocente && colocacion.Docente?.Id != docenteId) {
                return;
              }
              const colocacionFiltrada =
                this.construirObjetoColocacion(colocacion);
              this.colocaciones.push(colocacionFiltrada);
            }
          });
        }
        this.mostrarListaColocaciones();
      });
  }

  construirObjetoColocacion(colocacion: any) {
    const dia = this.calcularDia(
      colocacion.ResumenColocacionEspacioFisico.colocacion
    );
    const hora =
      colocacion.ResumenColocacionEspacioFisico.colocacion.horaFormato;
    const espacioFisico =
      colocacion.ResumenColocacionEspacioFisico.espacio_fisico;
    return {
      _id: colocacion._id,
      espacioAcademico: colocacion.EspacioAcademico,
      grupo: colocacion.EspacioAcademico.grupo,
      horario: `${dia} ${hora}`,
      sede: espacioFisico.sede.Nombre,
      edificio: espacioFisico.edificio.Nombre,
      salon: espacioFisico.salon.Nombre,
      colocacionResRaw: colocacion,
    };
  }

  calcularDia(colocacion: any) {
    const diasDeLaSemana = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    const dia = Math.floor(colocacion.dragPosition.x / 110); //110 es el valor asignado para el grosor de una colocacion
    const nombreDia = diasDeLaSemana[dia];
    return nombreDia;
  }

  mostrarListaColocaciones() {
    if (!(this.colocaciones.length > 0)) {
      return this.popUpManager.showAlert(
        '',
        this.translate.instant(
          'gestion_horarios.no_hay_colocaciones_con_parametros_seleccionados'
        )
      );
    }
    this.banderaListaColocaciones = true;
  }

  cargarTodosLosEspacios(grupos: any[]) {
    let todosLosEspacios: any[] = [];
    let padresSet = new Set<string>();

    grupos.forEach((grupo: any) => {
      if (grupo.EspaciosAcademicos && grupo.EspaciosAcademicos.activos) {
        grupo.EspaciosAcademicos.activos.forEach((espacio: any) => {
          if (!padresSet.has(espacio.espacio_academico_padre)) {
            padresSet.add(espacio.espacio_academico_padre);
            let esp = { ...espacio };
            esp.Nombre = esp.nombre; // sin el grupo porque representa a todos
            // Eliminamos la asignación de grupoReal para no autoseleccionar a un grupo
            todosLosEspacios.push(esp);
          }
        });
      }
    });

    // Ordenar los espacios si es necesario, o solo dejarlos así
    this.espaciosAcademicosDeGrupoEstudio = todosLosEspacios;
  }

  cargarEspaciosDeGrupoEstudio(grupo: any) {
    // Si limpian el grupo, o cambian...
    if (!grupo) return;
    this.espaciosAcademicosDeGrupoEstudio =
      grupo.EspaciosAcademicos.activos.map((espacio: any) => {
        let esp = { ...espacio };
        esp.Nombre = esp.nombre + ' (' + esp.grupo + ')';
        esp.grupoReal = grupo;
        return esp;
      });
  }

  iniciarFormularioConsulta() {
    this.formParaConsulta = this.fb.group({
      semestre: ['', Validators.required],
      grupoEstudio: [{ value: '', disabled: true }, Validators.required],
      espacioAcademico: [{ value: '', disabled: true }, Validators.required],
      docente: [{ value: '', disabled: true }, Validators.required],
    });
    this.selectsParaConsulta = selectsParaConsulta;

    // Custom sequential logic to allow choosing espacioAcademico without grupoEstudio
    this.formParaConsulta.get('semestre')?.valueChanges.subscribe(value => {
      if (value) {
        this.formParaConsulta.get('grupoEstudio')?.enable();
        this.formParaConsulta.get('espacioAcademico')?.enable();
      } else {
        this.formParaConsulta.get('grupoEstudio')?.disable();
        this.formParaConsulta.get('espacioAcademico')?.disable();
      }
      this.formParaConsulta.get('grupoEstudio')?.setValue('');
      this.formParaConsulta.get('espacioAcademico')?.setValue('');
      this.formParaConsulta.get('docente')?.setValue('');
    });

    this.formParaConsulta.get('grupoEstudio')?.valueChanges.subscribe(value => {
      if (!value) {
        this.formParaConsulta.get('espacioAcademico')?.setValue('');
        this.formParaConsulta.get('docente')?.setValue('');
        // When group is cleared, reset to all spaces
        if (this.gruposEstudio && this.gruposEstudio.length > 0) {
          this.cargarTodosLosEspacios(this.gruposEstudio);
        }
      } else {
        // If a group is selected, we clear space and teacher, unless space was already selected to trigger this group
        // But wait! If we auto-selected the group in `cargarDocentesDeEspacio`, we passed `{emitEvent: false}`!
        // So this valueChanges WON'T trigger when we auto-select the group! Perfect!
        this.formParaConsulta.get('espacioAcademico')?.setValue('');
        this.formParaConsulta.get('docente')?.setValue('');
      }
    });

    this.formParaConsulta.get('espacioAcademico')?.valueChanges.subscribe(value => {
      if (value) {
        this.formParaConsulta.get('docente')?.enable();
      } else {
        this.formParaConsulta.get('docente')?.disable();
      }
      this.formParaConsulta.get('docente')?.setValue('');
    });
  }

  volverASelectsParametrizables() {
    this.volverASelects.emit(true);
  }
}

/*export function datosPrueba() {
  return {
    nivel: {
      Activo: true,
      CodigoAbreviacion: 'POS',
      Descripcion: 'Posgrado',
      FechaCreacion: '2019-11-15 00:43:28.591057 +0000 +0000',
      FechaModificacion: '2019-11-15 00:43:28.591057 +0000 +0000',
      Id: 2,
      NivelFormacionPadreId: null,
      Nombre: 'Posgrado',
      NumeroOrden: 2,
    },
    periodo: {
      Activo: true,
      AplicacionId: 41,
      Ciclo: '1',
      CodigoAbreviacion: 'PA',
      Descripcion: 'Periodo académico 2022-1',
      FechaCreacion: '2022-03-11 11:18:15.094268 +0000 +0000',
      FechaModificacion: '2024-06-21 08:30:12.060977 +0000 +0000',
      FinVigencia: '2022-06-30T00:00:00Z',
      Id: 31,
      InicioVigencia: '2022-03-08T00:00:00Z',
      Nombre: '2022-1',
      Year: 2022,
    },
    planEstudio: {
      Activo: true,
      AnoResolucion: 2021,
      Codigo: '123',
      CodigoAbreaviacion: '',
      EsPlanEstudioPadre: false,
      EspaciosSemestreDistribucion:
        '{"semestre_1":{"espacios_academicos":[{"espacio_1":{"Id":"64935cac85308dfabd19a938","OrdenTabla":1,"EspaciosRequeridos":{"Id":"NA"}}}]},"semestre_2":{"espacios_academicos":[{"espacio_1":{"Id":"64935cf285308d74f119a93c","OrdenTabla":1,"EspaciosRequeridos":{"Id":"NA"}}},{"espacio_2":{"Id":"64935d4d85308d4a7019a940","OrdenTabla":2,"EspaciosRequeridos":{"Id":"NA"}}}]}}',
      EstadoAprobacionId: {
        Id: 2,
        Nombre: 'Por Revisar',
        Descripcion: 'Por Revisar',
        CodigoAbreviacion: 'REV',
        Activo: true,
      },
      FechaCreacion: '2023-08-25 11:05:51.30267 +0000 +0000',
      FechaModificacion: '2023-11-07 20:42:49.05516 +0000 +0000',
      Id: 1,
      Nombre: 'Plan de estudio Prueba',
      NumeroResolucion: 123,
      NumeroSemestres: 8,
      Observacion: '',
      ProyectoAcademicoId: 31,
      ResumenPlanEstudios:
        '{"nombre":"TOTAL","creditos":8,"htd":144,"htc":96,"hta":144,"OB":0,"OC":0,"EI":0,"EE":0,"CP":0,"ENFQ_TEO":3,"ENFQ_PRAC":0,"ENFQ_TEOPRAC":0,"numero_semestres":2}',
      RevisorId: 0,
      RevisorRol: '',
      SoporteDocumental: '{"SoporteDocumental":[150561,150562]}',
      TotalCreditos: 164,
    },
    proyecto: {
      Activo: true,
      AnoActoAdministrativo: '2020',
      AreaConocimientoId: 7,
      CiclosPropedeuticos: false,
      Codigo: '125',
      CodigoAbreviacion: 'MAESINGINDUS',
      CodigoSnies: '234567',
      Competencias: 'Maestria en Ingenieria Industrial',
      CorreoElectronico: 'maestriaingindust@correo.com',
      DependenciaId: 623,
      Duracion: 10,
      EnlaceActoAdministrativo: '2493',
      FacultadId: 14,
      FechaCreacion: '2021-08-04 20:48:47.852479 +0000 +0000',
      FechaModificacion: '2023-06-21 15:19:08.690044 +0000 +0000',
      Id: 31,
      MetodologiaId: {
        Id: 1,
        Nombre: 'Presencial',
        Descripcion: 'Presencial',
        CodigoAbreviacion: 'PRE',
        Activo: true,
      },
      ModalidadId: null,
      NivelFormacionId: {
        Id: 7,
        Nombre: 'Maestria',
        Descripcion: 'maestria',
        CodigoAbreviacion: 'MAS',
        Activo: true,
      },
      Nombre: 'Maestría en Ingeniería Industrial',
      NucleoBaseId: 9,
      NumeroActoAdministrativo: 123,
      NumeroCreditos: 60,
      Oferta: true,
      ProyectoPadreId: null,
      UnidadTiempoId: 6,
    },
    semestre: {
      Activo: true,
      CodigoAbreviacion: '1ERS',
      Descripcion: 'Primer semestre',
      FechaCreacion: '2024-06-18 14:49:57.465242 +0000 +0000',
      FechaModificacion: '2024-06-18 14:54:18.418942 +0000 +0000',
      Id: 6507,
      Nombre: 'Primer semestre',
      NumeroOrden: 1,
      ParametroPadreId: null,
      TipoParametroId: {
        Id: 107,
        Nombre: 'Semestre académico',
        Descripcion: 'Semestre académico',
        CodigoAbreviacion: 'SA',
        Activo: true,
      },
    },
    subnivel: {
      Activo: true,
      CodigoAbreviacion: 'MAS',
      Descripcion: 'maestria',
      FechaCreacion: '2021-01-05 17:14:35.50068 +0000 +0000',
      FechaModificacion: '2021-01-05 17:14:35.50068 +0000 +0000',
      Id: 7,
      NivelFormacionPadreId: {
        Id: 2,
        Nombre: 'Posgrado',
        Descripcion: 'Posgrado',
        CodigoAbreviacion: 'POS',
        Activo: true,
      },
      Nombre: 'Maestria',
      NumeroOrden: 7,
    },
    actividadesCalendario: {
      actividadesGestionHorario: [
        {
          FechaFin: '2024-08-31T00:00:00Z',
          FechaInicio: '2024-08-01T00:00:00Z',
          Id: 296,
          Nombre: 'Producción de horarios',
        },
      ],
      actividadesGestionPlanDocente: [
        {
          FechaFin: '2024-08-31T00:00:00Z',
          FechaInicio: '2024-08-01T00:00:00Z',
          Id: 295,
          Nombre: 'Plan de trabajo docente',
        },
      ],
    },
  };
}
*/