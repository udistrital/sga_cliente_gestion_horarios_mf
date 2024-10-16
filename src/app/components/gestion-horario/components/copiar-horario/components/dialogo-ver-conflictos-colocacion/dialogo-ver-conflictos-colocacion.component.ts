import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { HorarioMidService } from '../../../../../../services/horario-mid.service';

@Component({
  selector: 'udistrital-dialogo-ver-conflictos-colocacion',
  templateUrl: './dialogo-ver-conflictos-colocacion.component.html',
  styleUrl: './dialogo-ver-conflictos-colocacion.component.scss',
})
export class DialogoVerConflictosColocacionComponent implements OnInit {
  //Cuando la colocacion de sobrepone con colocaciones del grupo de estudio
  banderaConflictoGrupoEstudio = false;
  //Cuando el espacio fisico de la colocacion ya esta ocupado por otro
  banderaConflictoEspacioFisico = false;
  //Cuando el espacio académico no ha sido sido asignado al grupo de estudio o no existe.
  banderaConflictoEspacioAcademico = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public colocacion: any,
    public dialogRef: MatDialogRef<DialogoVerConflictosColocacionComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioMid: HorarioMidService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.organizarConflictos();
  }

  organizarConflictos() {
    //Si los dos conflictos son de la misma colocacion
    // solo se deja el de grupo de estudio
    if (
      this.colocacion.conflictoGrupoEstudio?._id ==
      this.colocacion.conflictoEspacioFisico?._id
    ) {
      delete this.colocacion.conflictoEspacioFisico;
    }

    if (this.colocacion.conflictoGrupoEstudio) {
      this.banderaConflictoGrupoEstudio = true;
    }

    if (this.colocacion.conflictoEspacioFisico) {
      this.banderaConflictoEspacioFisico = true;
    }

    if (this.colocacion.conflictoEspacioAcademico) {
      this.banderaConflictoEspacioAcademico = true;
    }
  }

  async preguntarCreacionGrupo() {
    const espacioAcademico = await this.construirObjetoEspacioAcademico();

    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(
          'gestion_horarios.desea_crear_grupo_espacio_academico'
        ) +
          ' ' +
          this.colocacion.espacioAcademico.nombre +
          ' - ' +
          this.colocacion.grupo
      )
      .then((confirmado) => {
        if (!confirmado.value) {
          return;
        }

        this.crearEspacioAcademico(espacioAcademico);
      });
  }

  async construirObjetoEspacioAcademico() {
    const espacioAcademicoPadreId =
      this.colocacion.espacioAcademico.espacio_academico_padre;

    const res: any = await this.espacioAcademicoService
      .get(`espacio-academico/${espacioAcademicoPadreId}`)
      .toPromise();

    if (res.Success) {
      const grupoEspacioAcademico = res.Data;
      grupoEspacioAcademico.periodo_id = this.colocacion.periodo.Id;
      grupoEspacioAcademico.grupo = this.colocacion.grupo;
      grupoEspacioAcademico.espacio_academico_padre = res.Data._id;
      grupoEspacioAcademico.grupo_estudio_id = this.colocacion.grupoEstudio._id;
      // Para el post, o si no genera error porque el id ya existe
      delete grupoEspacioAcademico._id;

      return grupoEspacioAcademico;
    }
  }

  crearEspacioAcademico(espacio: any) {
    this.horarioMid
      .post(`grupo-estudio/espacio-academico`, espacio)
      .subscribe((res: any) => {
        if (res.Success) {
          this.popUpManager.showSuccessAlert(
            this.translate.instant(
              'gestion_horarios.grupo_espacio_academico_creado'
            )
          );
          this.dialogRef.close({
            grupoCreado: true,
          });
        }
      });
  }
}
