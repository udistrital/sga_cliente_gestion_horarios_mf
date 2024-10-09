import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { espaciosAcademicosContructorTabla } from './utilidades';
import { ordenarPorPropiedad } from '../../../../../../../utils/listas';
import { HorarioMidService } from '../../../../../../services/horario-mid.service';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { DialogoVerConflictosColocacionComponent } from '../dialogo-ver-conflictos-colocacion/dialogo-ver-conflictos-colocacion.component';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../../../managers/popUpManager';

@Component({
  selector: 'udistrital-dialogo-lista-restricciones-copiado',
  templateUrl: './dialogo-conflictos-copiado.component.html',
  styleUrl: './dialogo-conflictos-copiado.component.scss',
})
export class DialogoConflictosCopiadoComponent implements OnInit {
  colocaciones: any;
  colocacionesContructorTabla: any;
  tablaColumnas: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoCopiado: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogoConflictosCopiadoComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioMid: HorarioMidService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.construirTabla();
    this.verificarConflictosHorario();
  }

  verificarConflictosHorario() {
    this.colocaciones.forEach((colocacion: any) => {
      this.verificarEspacioAcademicoExistente(colocacion);
      this.verificarConflictosGrupoEstudio(colocacion);
      this.verificarConflictosEspacioFisico(colocacion);
    });
  }

  verificarConflictosGrupoEstudio(colocacion: any) {
    const grupoEstudioId = this.infoCopiado.grupoEstudio._id;
    const periodoId = this.infoCopiado.periodo.Id;
    const colocacionId = colocacion._id;

    colocacion.verificandoConflictos = true;
    this.horarioMid
      .get(
        `colocacion-espacio-academico/grupo-estudio/sobreposicion?grupo-estudio-id=${grupoEstudioId}&periodo-id=${periodoId}&colocacion-id=${colocacionId}`
      )
      .subscribe((res: any) => {
        if (res.Success && res.Data.sobrepuesta) {
          colocacion.conConflicto = true;
          colocacion.conflictoGrupoEstudio = res.Data.colocacionConflicto;
        }
        colocacion.verificandoConflictos = false;
      });
  }

  verificarConflictosEspacioFisico(colocacion: any) {
    const periodoId = this.infoCopiado.periodo.Id;
    const colocacionId = colocacion._id;

    colocacion.verificandoConflictos = true;
    this.horarioMid
      .get(
        `colocacion-espacio-academico/espacio-fisico/sobreposicion?periodo-id=${periodoId}&colocacion-id=${colocacionId}`
      )
      .subscribe((res: any) => {
        if (res.Success && res.Data.sobrepuesta) {
          colocacion.conConflicto = true;
          colocacion.conflictoEspacioFisico = res.Data.colocacionConflicto;
        }
        colocacion.verificandoConflictos = false;
      });
  }

  verificarEspacioAcademicoExistente(colocacion: any) {
    const espacioAcademico = colocacion.espacioAcademico.nombre;
    const periodoId = this.infoCopiado.periodo.Id;
    const grupo = colocacion.grupo;
    colocacion.verificandoConflictos = true;
    this.espacioAcademicoService
      .get(
        `espacio-academico?query=nombre:${espacioAcademico},periodo_id:${periodoId},grupo:${grupo},activo:true`
      )
      .subscribe((res: any) => {
        if (res.Data && !(res.Data.length > 0)) {
          colocacion.conConflicto = true;
          colocacion.conflictoEspacioAcademico = {
            noExisteEspacio: true,
          };
          colocacion.verificandoConflictos = false;
          return;
        }
        //si el espacio existe, verificamos si es del grupo de estudio o esta en otro grupo
        this.verificarEspacioEnGrupoEstudio(colocacion);
      });
  }

  verificarEspacioEnGrupoEstudio(colocacion: any) {
    const espacioAcademico = colocacion.espacioAcademico.nombre;
    const grupo = colocacion.grupo;
    const grupoEstudioId = this.infoCopiado.grupoEstudio._id;
    this.espacioAcademicoService
      .get(
        `espacio-academico?query=nombre:${espacioAcademico},grupo_estudio_id:${grupoEstudioId},grupo:${grupo},activo:true`
      )
      .subscribe((res: any) => {
        if (res.Data && !(res.Data.length > 0)) {
          colocacion.conConflicto = true;
          colocacion.conflictoEspacioAcademico = {
            noPerteneceGrupoEstudio: true,
          };
        }

        colocacion.espacioAcademicoACopiarId = res.Data[0]._id;
        colocacion.verificandoConflictos = false;
      });
  }

  abrirDialogoVerConflictos(colocacion: any) {
    colocacion.periodo = this.infoCopiado.periodo;
    colocacion.grupoEstudio = this.infoCopiado.grupoEstudio;
    const dialogRef = this.dialog.open(
      DialogoVerConflictosColocacionComponent,
      {
        width: '60%',
        height: 'auto',
        maxHeight: '75vh',
        data: colocacion,
      }
    );

    dialogRef.afterClosed().subscribe((res) => {
      if (res?.grupoCreado) {
        this.colocaciones.forEach((colocacion: any) => {
          this.quitarConflictosColocacion(colocacion);
        });
        this.verificarConflictosHorario();
      }
    });
  }

  construirTabla() {
    this.colocacionesContructorTabla = espaciosAcademicosContructorTabla;
    this.tablaColumnas = this.colocacionesContructorTabla.map(
      (column: any) => column.columnDef
    );
    //Asigna la info a la tabla
    this.colocaciones = ordenarPorPropiedad(
      this.infoCopiado.colocaciones,
      'grupo',
      1
    );
  }

  quitarConflictosColocacion(colocacion: any) {
    delete colocacion.conflictoGrupoEstudio;
    delete colocacion.conflictoEspacioFisico;
    delete colocacion.conflictoEspacioAcademico;
    delete colocacion.conConflicto;
    delete colocacion.verificandoConflictos;
  }

  preguntarCopiadoColocaciones() {
    let colocacionesParaCopiado: any = [];
    this.colocaciones.forEach((colocacion: any) => {
      if (!colocacion.conConflicto && !colocacion.verificandoConflictos) {
        colocacion = {
          colocacionId: colocacion._id,
          espacioAcademicoId: colocacion.espacioAcademicoACopiarId,
        };
        colocacionesParaCopiado.push(colocacion);
      }
    });

    if (colocacionesParaCopiado.length == 0) {
      return this.popUpManager.showAlert(
        '',
        this.translate.instant(
          'gestion_horarios.no_copiado_porque_todas_conflictos'
        )
      );
    }
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(
          'gestion_horarios.info_desea_copiar_colocaciones'
        ),
        this.translate.instant('gestion_horarios.desea_copiar_colocaciones')
      )
      .then((confirmado) => {
        if (!confirmado.value) {
          return;
        }
        this.copiarColocaciones(colocacionesParaCopiado);
      });
  }

  copiarColocaciones(colocaciones: any) {
    const infoCopiado = {
      grupoEstudioId: this.infoCopiado.grupoEstudio._id,
      periodoId: this.infoCopiado.periodo.Id,
      colocaciones: colocaciones,
    };

    this.horarioMid
      .post(`colocacion-espacio-academico/copiar`, infoCopiado)
      .subscribe((res: any) => {
        if (res.Success) {
          this.popUpManager.showAlert(
            '',
            this.translate.instant(
              'gestion_horarios.colocaciones_copiadas_satisfactoriamente'
            )
          );
          this.dialogRef.close();
        }
      });
  }
}
