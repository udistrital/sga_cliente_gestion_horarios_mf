import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ParametrosService } from '../../../../services/parametros.service';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ordenarPorPropiedad } from '../../../../../utils/listas';
import { Parametros } from '../../../../../utils/Parametros';
import { GestionExistenciaHorarioService } from '../../../../services/gestion-existencia-horario.service';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { PopUpManager } from '../../../../managers/popUpManager';
import { selectsParaConsulta } from './utilidades';

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

  formParaConsulta!: FormGroup;
  horario: any;
  gruposEstudio: any;
  semestresDePlanEstudio: any;
  selectsParaConsulta: any;

  tablaEspaciosAcademicosVisible: boolean = false;
  espaciosAcademicosContructorTabla: any[] = [];
  espaciosAcademicos: any;
  grupo: any;
  periodo: any;
  periodos: any[] = [];
  tablaColumnas: any[] = [];

  constructor(
    private horarioMid: HorarioMidService,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private fb: FormBuilder,
    private parametros: Parametros,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.dataParametrica = datosPrueba();
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

  buscarEspaciosAcademicos() {
    this.tablaEspaciosAcademicosVisible = true;
    this.espaciosAcademicos = this.obtenerDatosDePrueba();
    this.construirTabla();
  }

  construirTabla() {
    this.espaciosAcademicosContructorTabla = [
      {
        columnDef: 'codigo_espacio_academico',
        header: this.translate.instant('ptd.codigo_espacio_academico'),
        cell: (aspirante: any) => aspirante.CodigoEspacioAcademico,
      },
      {
        columnDef: 'espacio_academico',
        header: this.translate.instant('ptd.espacio_academico'),
        cell: (aspirante: any) => aspirante.EspacioAcademico,
      },
      {
        columnDef: 'grupo',
        header: this.translate.instant('gestion_horarios.grupo'),
        cell: (aspirante: any) => aspirante.Grupo,
      },
      {
        columnDef: 'horario',
        header: this.translate.instant('gestion_horarios.horario'),
        cell: (aspirante: any) => aspirante.Horario,
      },
      {
        columnDef: 'espacio_fisico',
        header: this.translate.instant('gestion_horarios.espacio_academico'),
        cell: (aspirante: any) => aspirante.EspacioFisico,
      },
      {
        columnDef: 'seleccionar',
        header: this.translate.instant('GLOBAL.seleccionar'),
        cell: (aspirante: any) => '',
      },
    ];

    this.tablaColumnas = this.espaciosAcademicosContructorTabla.map(
      (column) => column.columnDef
    );
    //Asigna la info a la tabla
    this.espaciosAcademicos = new MatTableDataSource(this.espaciosAcademicos);
    //Asigna el paginador
    setTimeout(() => {
      this.espaciosAcademicos.paginator = this.paginator;
    }, 1000);
  }

  iniciarFormularioConsulta() {
    this.formParaConsulta = this.fb.group({
      semestre: ['', Validators.required],
      grupoEstudio: ['', Validators.required],
      espacioAcademico: ['', Validators.required],
      docente: ['', Validators.required],
    });
    this.selectsParaConsulta = selectsParaConsulta;
  }

  copiarEspacioAcademico() {}

  ocultarCopiarHorario() {}

  obtenerDatosDePrueba() {
    return [
      {
        CodigoEspacioAcademico: '1234',
        EspacioAcademico: 'Física',
        Grupo: 'Grupo 3',
        Horario: 'Miércoles 08:00 - 10:00',
        EspacioFisico: 'Aula 103',
        Seleccionar: 'Seleccionar',
      },
      {
        CodigoEspacioAcademico: '5678',
        EspacioAcademico: 'Química',
        Grupo: 'Grupo 4',
        Horario: 'Jueves 16:00 - 18:00',
        EspacioFisico: 'Aula 104',
        Seleccionar: 'Seleccionar',
      },
      {
        CodigoEspacioAcademico: '8976',
        EspacioAcademico: 'Matemáticas',
        Grupo: 'Grupo 1',
        Horario: 'Lunes 10:00 - 12:00',
        EspacioFisico: 'Aula 101',
        Seleccionar: 'Seleccionar',
      },
      {
        CodigoEspacioAcademico: '8976',
        EspacioAcademico: 'Historia',
        Grupo: 'Grupo 2',
        Horario: 'Martes 14:00 - 16:00',
        EspacioFisico: 'Aula 102',
        Seleccionar: 'Seleccionar',
      },
    ];
  }

  volverASelectsParametrizables() {
    this.volverASelects.emit(true);
  }
}

export function datosPrueba() {
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
          DentroFechas: true,
          FechaFin: '2024-08-31T00:00:00Z',
          FechaInicio: '2024-08-01T00:00:00Z',
          Id: 296,
          Nombre: 'Producción de horarios',
        },
      ],
      actividadesGestionPlanDocente: [
        {
          DentroFechas: true,
          FechaFin: '2024-08-31T00:00:00Z',
          FechaInicio: '2024-08-01T00:00:00Z',
          Id: 295,
          Nombre: 'Plan de trabajo docente',
        },
      ],
    },
  };
}
