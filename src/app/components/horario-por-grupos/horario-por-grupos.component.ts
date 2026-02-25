import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ACTIONS,
  MODALS,
  ROLES,
  VIEWS,
} from '../../models/diccionario/diccionario';
import { HttpErrorResponse } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../theme/ng2-st-button/ng2-st-button.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { ParametrosService } from '../../services/parametros.service';
import { EspacioAcademicoService } from '../../services/espacio-academico.service';
import { HorarioMidService } from '../../services/horario-mid.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Parametros } from '../../../utils/Parametros';
import { selectsParametrizados } from './utilidades';
import { HorarioService } from '../../services/horario.service';

@Component({
  selector: 'udistrital-horario-por-grupos',
  templateUrl: './horario-por-grupos.component.html',
  styleUrl: './horario-por-grupos.component.scss',
})
export class HorarioPorGruposComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'index',
    'nombre',
    'codigo',
    'estado',
    'grupo',
    'cupos',
    'inscritos',
    'dia',
    'hora',
  ];

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
  subniveles!: any;
  proyectos!: any;
  planesEstudios!: any;
  semestres!: any;
  periodos: any;
  espaciosAcademicos!: any[];
  grupos!: any[];
  //Valores seleccionados de los select parametricos
  selectsParametrizados: any;
  [key: string]: any;

  readonly ACTIONS = ACTIONS;
  crear_editar!: Symbol;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private formBuilder: FormBuilder,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioMidService: HorarioMidService,
    private horarioService: HorarioService,
    private parametros: Parametros
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
      this.updateLanguage();
    });
  }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.iniciarFormularioConsulta();
    this.selectsParametrizados = selectsParametrizados;
    this.cargarNiveles();
    this.cargarPeriodos();

    // load additional selects unique to this component
    // (Ahora se cargan via cargarGruposYEspacios al cambiar el semestre o periodo)

    this.createTable();

    this.dataSource = new MatTableDataSource<any>(
      this.tbDiponibilidadHorarios as any[]
    );
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // * ----------
  // * Creación de tabla (lista espacios_academicos)
  //#region
  createTable() {
    this.tbDiponibilidadHorarios = {
      columns: {
        index: {
          title: '#',
          filter: false,
          valuePrepareFunction: (value: any, row: any, cell: any) => {
            return cell.row.index + 1;
          },
          width: '2%',
        },
        nombre: {
          title: this.translate.instant('gestion_horarios.periodo_academico'),
          editable: false,
          width: '5%',
          filter: true,
        },
        codigo: {
          title: this.translate.instant('gestion_horarios.sede'),
          editable: false,
          width: '15%',
          filter: true,
        },
        estado: {
          title: this.translate.instant('gestion_horarios.edificio'),
          editable: false,
          width: '15%',
          filter: true,
        },
        grupo: {
          title: this.translate.instant('gestion_horarios.salon'),
          editable: false,
          width: '8%',
          filter: true,
        },
        cupos: {
          title: this.translate.instant('gestion_horarios.proyecto_academico'),
          editable: false,
          width: '12%',
          filter: true,
        },
        inscritos: {
          title: this.translate.instant('gestion_horarios.espacio_academico'),
          editable: false,
          width: '12%',
          filter: true,
        },
        dia: {
          title: this.translate.instant('gestion_horarios.dia'),
          editable: false,
          width: '8%',
          filter: true,
        },
        hora: {
          title: this.translate.instant('gestion_horarios.hora'),
          editable: false,
          width: '8%',
          filter: true,
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found'),
    };
  }

  iniciarFormularioConsulta() {
    this.formStep1 = this.formBuilder.group({
      nivel: ['', Validators.required],
      subnivel: ['', Validators.required],
      proyecto: ['', Validators.required],
      planEstudio: ['', Validators.required],
      semestre: ['', Validators.required],
      periodo: ['', Validators.required],
      espacioacademico: [''],
      grupo: ['', Validators.required]
    });
  }

  updateLanguage() {
    // Left empty since translation of selects is done in template via selectsParametrizados
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

  cargarPlanesEstudioSegunProyectoCurricular(proyecto: any) {
    this.parametros.planesEstudioSegunProyectoCurricular(proyecto).subscribe((res: any) => {
      this.planesEstudios = res
    })
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros.semestresSegunPlanEstudio(planEstudio).subscribe((res: any) => {
      this.semestres = res
    })
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res
    })
  }

  cargarGruposYEspacios(selectedValue?: any) {
    const formVals = this.formStep1.value;
    const proyectoId = formVals.proyecto?.Id;
    const planEstudioId = formVals.planEstudio?.Id;
    const periodoId = formVals.periodo?.Id;
    const semestreId = formVals.semestre?.Id;

    if (proyectoId && planEstudioId && periodoId && semestreId) {
      this.loading = true;
      const queryStr = `ProyectoAcademicoId:${proyectoId},PlanEstudioId:${planEstudioId},PeriodoId:${periodoId},Activo:true`;

      this.horarioService.get(`horario?query=${queryStr}&limit=0`).subscribe({
        next: (res: any) => {
          let horarioId = null;
          if (res && res.Data && res.Data.length > 0 && res.Data[0]._id !== undefined) {
            horarioId = res.Data[0]._id;
          } else if (res && res.length > 0 && res[0]._id !== undefined) {
            horarioId = res[0]._id;
          }

          if (horarioId) {
            this.horarioMidService.get(`grupo-estudio?horario-id=${horarioId}&semestre-id=${semestreId}`).subscribe({
              next: (midRes: any) => {
                this.loading = false;
                let midData = [];
                if (midRes && midRes.Data) {
                  midData = midRes.Data;
                } else if (Array.isArray(midRes)) {
                  midData = midRes;
                }

                // Mapear los grupos devueltos para el Select de 'Grupo'
                this.grupos = midData.map((grupo: any) => ({
                  ...grupo,
                  Nombre: grupo.Nombre || grupo.nombre,
                  Id: grupo._id || grupo.Id
                }));

                // Se inicializa el select de espacios en vacío. 
                // Se actualizará al seleccionar un grupo.
                this.espaciosAcademicos = [];
              },
              error: (midErr) => {
                this.loading = false;
                this.grupos = [];
                this.espaciosAcademicos = [];
              }
            });
          } else {
            this.loading = false;
            this.grupos = [];
            this.espaciosAcademicos = [];
          }
        },
        error: (err) => {
          this.loading = false;
          this.grupos = [];
          this.espaciosAcademicos = [];
        }
      });
    }
  }

  cargarInfoEspacioAcademico(espacioAcademicoSeleccionado: any) {
    if (espacioAcademicoSeleccionado && espacioAcademicoSeleccionado.Id) {
      const id = espacioAcademicoSeleccionado.Id;
      this.espacioAcademicoService.get(`espacio-academico/${id}`).subscribe({
        next: (res: any) => {
          console.log("Información del espacio académico:", res);
        },
        error: (err) => {
          console.error("Error al obtener la información del espacio académico", err);
        }
      });
    }
  }

  cargarEspaciosAcademicosPorGrupo(grupoSeleccionado: any) {
    if (grupoSeleccionado && grupoSeleccionado.EspaciosAcademicos && grupoSeleccionado.EspaciosAcademicos.activos) {
      let espaciosSet = new Map();
      grupoSeleccionado.EspaciosAcademicos.activos.forEach((espacio: any) => {
        if (!espaciosSet.has(espacio._id)) {
          espaciosSet.set(espacio._id, {
            Nombre: espacio.nombre + ' (Grupo ' + espacio.grupo + ')',
            Id: espacio._id
          });
        }
      });
      this.espaciosAcademicos = Array.from(espaciosSet.values());
    } else {
      this.espaciosAcademicos = [];
    }
    this.formStep1.get('espacioacademico')?.setValue('');
  }

  consultarHorariosGrupos() {
    if (this.formStep1.invalid) {
      return;
    }

    this.loading = true;
    const formVals = this.formStep1.value;
    const grupoEstudioId = formVals.grupo.Id;
    const periodoId = formVals.periodo.Id;

    this.horarioMidService
      .get(`colocacion-espacio-academico?grupo-estudio-id=${grupoEstudioId}&periodo-id=${periodoId}`)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          let colocacionesData: any[] = [];

          if (res && res.Data && res.Data.length > 0) {
            colocacionesData = res.Data;

            // Si hay un espacio académico seleccionado se filtran los resultados
            if (formVals.espacioacademico && formVals.espacioacademico.Id) {
              colocacionesData = colocacionesData.filter(colocacion =>
                colocacion.EspacioAcademico && colocacion.EspacioAcademico._id === formVals.espacioacademico.Id
              );
            }
          }

          let index = 1;
          const rows = colocacionesData.map((colocacion: any) => {
            const colocacionFisica = colocacion.ResumenColocacionEspacioFisico.colocacion;
            const espacioFisico = colocacion.ResumenColocacionEspacioFisico.espacio_fisico;

            const dia = this.calcularDia(colocacionFisica);
            const hora = colocacionFisica.horaFormato;

            return {
              index: index++,
              nombre: formVals.periodo.Nombre,
              codigo: espacioFisico.sede.Nombre,
              estado: espacioFisico.edificio.Nombre,
              grupo: espacioFisico.salon.Nombre,
              cupos: formVals.proyecto.Nombre,
              inscritos: colocacion.EspacioAcademico.nombre,
              dia: dia,
              hora: hora
            };
          });

          this.dataSource.data = rows;
        },
        error: (err) => {
          console.error("Error al obtener las colocaciones:", err);
          this.loading = false;
          this.dataSource.data = [];
        }
      });
  }

  calcularDia(colocacion: any): string {
    const diasDeLaSemana = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    //110 es el valor asignado para el grosor de una colocacion (basado en gestion-horario)
    const diaIndex = Math.floor(colocacion.dragPosition.x / 110);
    return diasDeLaSemana[diaIndex] || '';
  }

  editElement(element: any) {
    // Lógica para editar un elemento
  }

  deleteElement(element: any) {
    // Lógica para eliminar un elemento
  }
}
