import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { inputsCrearGrupo } from './utilidades';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';

@Component({
  selector: 'udistrital-crear-espacio-grupo-dialog',
  templateUrl: './crear-espacio-grupo-dialog.component.html',
  styleUrl: './crear-espacio-grupo-dialog.component.scss',
})
export class CrearEspacioGrupoDialogComponent implements OnInit {
  inputsCrearGrupo: any;
  formCrearGrupo!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
    public dialogRef: MatDialogRef<CrearEspacioGrupoDialogComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private formBuilder: FormBuilder,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.iniciarFormCrearGrupo();
  }

  iniciarFormCrearGrupo(): void {
    this.formCrearGrupo = this.formBuilder.group({
      indicador: ['', Validators.required],
    });

    this.inputsCrearGrupo = inputsCrearGrupo;
  }

  crearGrupoEspacioAcademico() {
    const grupoEspacioAcademico = this.construirObjetoGrupoEspacioAcademico();
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(
          'gestion_horarios.desea_crear_grupo_espacio_academico'
        )
      )
      .then((confirmado) => {
        if (!confirmado.value) {
          return;
        }

        this.espacioAcademicoService
          .post('espacio-academico', grupoEspacioAcademico)
          .subscribe((res: any) => {
            if (res.Success) {
              this.popUpManager.showSuccessAlert(
                this.translate.instant(
                  'gestion_horarios.grupo_espacio_academico_creado'
                )
              );
              this.dialogRef.close({
                creado: true,
                info: res.Data,
              });
            }
          });
      });
  }

  construirObjetoGrupoEspacioAcademico() {
    const grupoEspacioAcademico = this.dataEntrante.espacioAcademico;
    grupoEspacioAcademico.periodo_id = this.dataEntrante.periodo.Id;
    grupoEspacioAcademico.grupo = this.formCrearGrupo.get('indicador')?.value;
    grupoEspacioAcademico.espacio_academico_padre = grupoEspacioAcademico._id;
    //para el post, o si no genera error porque el id ya existe
    delete grupoEspacioAcademico._id;
    return grupoEspacioAcademico;
  }
}
