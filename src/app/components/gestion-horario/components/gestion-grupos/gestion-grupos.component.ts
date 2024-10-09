import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CrearGrupoDialogComponent } from './components/crear-grupo-dialog/crear-grupo-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { gruposEstudioContructorTabla } from './utilidades';
import { EditarGrupoDialogComponent } from './components/editar-grupo-dialog/editar-grupo-dialog.component';
import { PopUpManager } from '../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { Parametros } from '../../../../../utils/Parametros';
import { GestionExistenciaHorarioService } from '../../../../services/gestion-existencia-horario.service';

@Component({
  selector: 'udistrital-gestion-grupos',
  templateUrl: './gestion-grupos.component.html',
  styleUrl: './gestion-grupos.component.scss',
})
export class GestionGruposComponent {
  gruposEstudioContructorTabla: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() dataParametrica: any;
  @Output() volverASelects = new EventEmitter<boolean>();

  banderaTablaGrupos: boolean = false;
  banderaBotonCrearGrupo: boolean = false;
  actividadGestionHorario: any;
  gruposEstudio: any;
  formSemestre!: FormGroup;
  horario: any;
  semestresDePlanEstudio: any;
  tablaColumnas: any;

  constructor(
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private horarioMid: HorarioMidService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.iniciarFormSemestre();
    this.cargarSemestresSegunPlanEstudio(this.dataParametrica.planEstudio);
  }

  listarGruposEstudioSegunParametros() {
    this.banderaBotonCrearGrupo = false;
    const horarioId = this.horario._id;
    const semestre = this.formSemestre.get('semestre')?.value;
    this.horarioMid
      .get(
        'grupo-estudio?horario-id=' + horarioId + '&semestre-id=' + semestre.Id
      )
      .subscribe((res: any) => {
        if (res.Success) {
          this.banderaBotonCrearGrupo = true;
          if (res.Data.length > 0) {
            this.gruposEstudio = res.Data;
            this.construirTabla();
            this.dataParametrica.semestre =
              this.formSemestre.get('semestre')?.value;
            this.banderaTablaGrupos = true;
          } else {
            this.popUpManager.showAlert(
              '',
              this.translate.instant('GLOBAL.no_informacion_registrada')
            );
            this.banderaTablaGrupos = false;
          }
        }
      });
  }

  construirTabla() {
    this.gruposEstudioContructorTabla = gruposEstudioContructorTabla;
    this.tablaColumnas = this.gruposEstudioContructorTabla.map(
      (column: any) => column.columnDef
    );
    //Asigna la info a la tabla
    this.gruposEstudio = new MatTableDataSource(this.gruposEstudio);
    setTimeout(() => {
      this.gruposEstudio.paginator = this.paginator;
    }, 1);
  }

  accionGrupoCRUD(comando: string, grupo?: any) {
    const hayActividadGestionHorario =
      this.verificarCalendarioParaGestionHorario();
    if (hayActividadGestionHorario) {
      switch (comando) {
        case 'abrirDialogoCrearGrupo':
          this.abrirDialogoCrearGrupo();
          break;
        case 'abrirDialogoEditarGrupo':
          this.abrirDialogoEditarGrupo(grupo);
          break;
        case 'eliminarGrupoEstudio':
          this.preguntarEliminadoGrupoEstudio(grupo);
          break;
      }
    }
  }

  abrirDialogoCrearGrupo() {
    const dialogRef = this.dialog.open(CrearGrupoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data: {
        ...this.dataParametrica,
        horario: this.horario,
        semestre: this.formSemestre.get('semestre')!.value,
      },
    });

    dialogRef.afterClosed().subscribe((grupoCreado) => {
      if (grupoCreado) {
        this.listarGruposEstudioSegunParametros();
      }
    });
  }

  abrirDialogoEditarGrupo(grupo: any) {
    grupo.proyecto = this.dataParametrica.proyecto;
    grupo.planEstudio = this.dataParametrica.planEstudio;
    grupo.semestre = this.dataParametrica.semestre;
    grupo.periodo = this.dataParametrica.periodo;

    const dialogRef = this.dialog.open(EditarGrupoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '70vh',
      data: grupo,
    });

    dialogRef.afterClosed().subscribe((grupoEditado) => {
      if (grupoEditado) {
        this.listarGruposEstudioSegunParametros();
      }
    });
  }

  preguntarEliminadoGrupoEstudio(grupo: any) {
    const grupoId = grupo._id;
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(
          'gestion_horarios.esta_seguro_eliminar_grupo_personas'
        )
      )
      .then((confirmado) => {
        if (confirmado.value) {
          this.eliminarGrupoEstudio(grupoId);
        }
      });
  }

  eliminarGrupoEstudio(grupoId: any) {
    this.horarioMid.delete('grupo-estudio', grupoId).subscribe((res: any) => {
      if (res.Message == 'tiene colocaciones') {
        return this.popUpManager.showAlert(
          '',
          this.translate.instant(
            'gestion_horarios.grupo_estudio_no_poder_eliminar_tiene_colocaciones'
          )
        );
      }

      this.listarGruposEstudioSegunParametros();
      this.popUpManager.showSuccessAlert(
        this.translate.instant('gestion_horarios.grupo_personas_eliminado')
      );
    });
  }

  buscarGrupoEstudio(event: Event) {
    const valorFiltro = (event.target as HTMLInputElement).value;
    this.gruposEstudio.filter = valorFiltro.trim().toLowerCase();
  }

  volverASelectsParametrizables() {
    this.volverASelects.emit(true);
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros
      .semestresSegunPlanEstudio(planEstudio)
      .subscribe((res: any) => {
        this.semestresDePlanEstudio = res;
        this.consultarExistenciaDeHorario();
      });
  }

  iniciarFormSemestre() {
    this.formSemestre = this._formBuilder.group({
      semestre: ['', Validators.required],
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

  verificarCalendarioParaGestionHorario(): boolean {
    const actividadGestionHorario =
      this.dataParametrica.actividadesCalendario.actividadesGestionHorario?.[0];
    if (actividadGestionHorario == null) {
      this.popUpManager.showAlert(
        '',
        this.translate.instant(
          'gestion_horarios.no_definido_proceso_para_horario_calendario'
        )
      );
      return false;
    }
    if (!actividadGestionHorario.DentroFechas) {
      this.popUpManager.showAlert(
        '',
        this.translate.instant('gestion_horarios.no_dentro_fechas_para_horario')
      );
      return false;
    }
    return true;
  }
}
