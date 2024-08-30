import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import {
  espaciosAcademicosContructorTabla,
  selectsCopiadoHorario,
} from './utilidades';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HorarioService } from '../../../../../../services/horario.service';
import { HorarioMidService } from '../../../../../../services/horario-mid.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametros } from '../../../../../../../utils/Parametros';
import { GestionExistenciaHorarioService } from '../../../../../../services/gestion-existencia-horario.service';
import { map } from 'rxjs';
import {
  establecerSelectsSecuenciales,
  reiniciarFormulario,
} from '../../../../../../../utils/formularios';
import { ordenarPorPropiedad } from '../../../../../../../utils/listas';

@Component({
  selector: 'udistrital-lista-copiar-horarios',
  templateUrl: './lista-copiar-horarios.component.html',
  styleUrl: './lista-copiar-horarios.component.scss',
})
export class ListaCopiarHorariosComponent implements OnInit, AfterViewInit {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  @Input() infoParaListaCopiarHorario: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  espaciosAcademicos: MatTableDataSource<any> = new MatTableDataSource();
  espaciosAcademicosContructorTabla: any;
  espaciosAcademicosSeleccionados: any[] = [];
  formCopiadoHorario!: FormGroup;
  gruposEstudio: any;
  horario: any;
  periodos: any;
  selectsCopiadoHorario: any;
  semestresDePlanEstudio: any;
  tablaColumnas: any;

  constructor(
    private popUpManager: PopUpManager,
    private fb: FormBuilder,
    private horarioMid: HorarioMidService,
    private horarioService: HorarioService,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private translate: TranslateService,
    private parametros: Parametros,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarPeriodos();
    this.iniciarFormularioCopiado();
  }

  ngAfterViewInit() {
    this.construirTabla();
    this.cdref.detectChanges();
  }

  construirTabla() {
    this.espaciosAcademicosContructorTabla = espaciosAcademicosContructorTabla;
    this.tablaColumnas = this.espaciosAcademicosContructorTabla.map(
      (column: any) => column.columnDef
    );
    //Asigna la info a la tabla
    this.espaciosAcademicos = new MatTableDataSource(
      this.infoParaListaCopiarHorario.espaciosAcademicos
    );
    this.espaciosAcademicos.paginator = this.paginator;
    this.espaciosAcademicos.sort = this.sort;
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res;
    });
  }

  iniciarFormularioCopiado() {
    this.formCopiadoHorario = this.fb.group({
      periodo: ['', Validators.required],
      semestre: ['', Validators.required],
      grupoEstudio: ['', Validators.required],
    });

    this.selectsCopiadoHorario = selectsCopiadoHorario;
    establecerSelectsSecuenciales(this.formCopiadoHorario);
  }

  verificarCalendarioParaGestionHorario(): boolean {
    const actividadGestionHorario =
      this.infoParaListaCopiarHorario.actividadGestionHorario;
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

  listarGruposEstudioSegunParametros() {
    console.log(this.horario);
    const semestre = this.formCopiadoHorario.get('semestre')?.value;
    const horarioId = this.horario._id;
    this.horarioMid
      .get(
        'grupo-estudio?horario-id=' + horarioId + '&semestre-id=' + semestre.Id
      )
      .subscribe((res: any) => {
        if (res.Success) {
          if (res.Data.length > 0) {
            this.gruposEstudio = ordenarPorPropiedad(res.Data, 'Nombre', 1);
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

  //verifica que en el periodo que se va a clonar tenga horario
  verificarExistenciaHorario() {
    const proyecto = this.infoParaListaCopiarHorario.proyecto;
    const plan = this.infoParaListaCopiarHorario.planEstudio;
    const periodo = this.formCopiadoHorario.get('periodo')?.value;

    return new Promise<boolean>((resolve) => {
      this.gestionExistenciaHorario.gestionarHorario(
        proyecto,
        plan,
        periodo,
        this.semestresDePlanEstudio,
        (horario: any) => {
          if (horario) {
            this.horario = horario;
            this.cargarSemestresSegunPlanEstudio();
          } else {
            reiniciarFormulario(this.formCopiadoHorario);
            this.popUpManager.showAlert(
              '',
              this.translate.instant(
                'gestion_horarios.no_clonar_sin_existencia_horario'
              )
            );
          }
        }
      );
    });
  }

  cargarSemestresSegunPlanEstudio() {
    const planEstudio = this.infoParaListaCopiarHorario.planEstudio;
    this.parametros
      .semestresSegunPlanEstudio(planEstudio)
      .subscribe((res: any) => {
        this.semestresDePlanEstudio = res;
      });
  }

  copiarHorario() {
    const hayActividadGestionHorario =
      this.verificarCalendarioParaGestionHorario();
    if (hayActividadGestionHorario) {
      const colocacionesIds = this.espaciosAcademicosSeleccionados.map(
        (espacio) => espacio._id
      );

      // this.horarioMid.post("horario/copiar", colocacionesIds).subscribe((res: any) => {
      //   if (res.Success) {
      //     this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.horario_copiado_satisfactoriamente"));
      //   }
      // }, Error => {
      //   this.popUpManager.showErrorAlert(this.translate.instant("gestion_horarios.error_horario_copiado"));
      // })
    }
  }

  //Para la funcionalidad del checkbox, para selecionar todos
  toggleAllCheckboxes(event: MatCheckboxChange) {
    if (event.checked) {
      this.espaciosAcademicosSeleccionados =
        this.espaciosAcademicos.data.slice();
    } else {
      this.espaciosAcademicosSeleccionados = [];
    }
    this.espaciosAcademicos.data.forEach(
      (row: any) => (row.isSelected = event.checked)
    );
  }

  isAllSelected() {
    const numSelected = this.espaciosAcademicosSeleccionados.length;
    const numRows = this.espaciosAcademicos.data.length;
    return numSelected === numRows;
  }

  isSomeSelected() {
    const numSelected = this.espaciosAcademicosSeleccionados.length;
    const numRows = this.espaciosAcademicos.data.length;
    return numSelected > 0 && numSelected < numRows;
  }

  checkboxEspacioAcademico(espacio: any): void {
    if (espacio.isSelected) {
      this.espaciosAcademicosSeleccionados.push(espacio);
    } else {
      this.espaciosAcademicosSeleccionados =
        this.espaciosAcademicosSeleccionados.filter(
          (selectedRow: any) => selectedRow !== espacio
        );
    }
    // Actualiza el estado del checkbox de selección masiva
    this.cdref.detectChanges();
  }
}
