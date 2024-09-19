import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin, map } from 'rxjs';
import { inputsFormStepDos } from './utilidades';
import { HorarioService } from '../../../../../../services/horario.service';
import { Parametros } from '../../../../../../../utils/Parametros';
import { CrearEspacioGrupoDialogComponent } from '../crear-espacio-grupo-dialog/crear-espacio-grupo-dialog.component';
import { DialogoVerEspaciosDesactivosComponent } from '../dialogo-ver-espacios-desactivos/dialogo-ver-espacios-desactivos.component';

@Component({
  selector: 'udistrital-editar-grupo-dialog',
  templateUrl: './editar-grupo-dialog.component.html',
  styleUrl: './editar-grupo-dialog.component.scss',
})
export class EditarGrupoDialogComponent implements OnInit {
  espaciosAcademicos: any;
  inputsFormStepDos!: any;
  formPaso1!: FormGroup;
  formPaso2!: FormGroup;
  gruposDeEspacioAcademico: any[] = [];
  idGruposYaSeleccionados: any[] = [];

  banderaHayGruposDesactivos: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoGrupoEstudio: any,
    public dialogRef: MatDialogRef<EditarGrupoDialogComponent>,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioService: HorarioService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.iniciarFormularios();
    this.obtenerMateriasSegunPlanYSemestre();
    console.log(this.infoGrupoEstudio);
  }

  obtenerMateriasSegunPlanYSemestre(): void {
    this.parametros
      .obtenerMateriasSegunPlanYSemestre(
        this.infoGrupoEstudio.planEstudio,
        this.infoGrupoEstudio.semestre.NumeroOrden
      )
      .subscribe((res) => {
        this.espaciosAcademicos = res;
        this.cargarDatosGrupoParaEditar();
      });
  }

  cargarDatosGrupoParaEditar(): void {
    this.cargarDatosGrupoPasoUno(this.infoGrupoEstudio);
    this.cargarDatosGrupoPasoDos(this.infoGrupoEstudio);
  }

  cargarDatosGrupoPasoUno(grupo: any): void {
    this.listaEspaciosGrupos.clear();
    if (grupo.EspaciosAcademicos.desactivos?.length > 0) {
      this.banderaHayGruposDesactivos = true;
    }

    const observables = grupo.EspaciosAcademicos.activos
      .map((espacio: any) => {
        const opcion = this.espaciosAcademicos.find(
          (op: any) => op._id === espacio.espacio_academico_padre
        );
        if (opcion) {
          this.listaEspaciosGrupos.push(this.crearGrupoForm(opcion));
          return this.cargarGruposDeEspacioAcademico(
            opcion,
            this.listaEspaciosGrupos.length - 1
          );
        }
        return null;
      })
      .filter(Boolean);

    forkJoin(observables).subscribe((respuestas: any) => {
      respuestas.forEach((grupos: any, index: any) => {
        const espacioSeleccionado = grupo.EspaciosAcademicos.activos[index];
        const opcion = grupos.find(
          (p: any) => p._id === espacioSeleccionado._id
        );
        if (opcion) {
          this.listaEspaciosGrupos.at(index).patchValue({ grupo: opcion });
          this.idGruposYaSeleccionados.push(opcion._id);
        }
      });
    });
  }

  cargarDatosGrupoPasoDos(grupo: any): void {
    this.formPaso2.patchValue({
      codigoProyecto: grupo.CodigoProyecto,
      indicador: grupo.IndicadorGrupo,
      codigoResultado: `${grupo.CodigoProyecto} ${grupo.IndicadorGrupo}`,
      capacidad: grupo.CuposGrupos,
    });
  }

  seleccionadoEspacioAcademico(espacioSeleccionado: any, index: number): void {
    this.gruposDeEspacioAcademico[index] = [];
    this.listaEspaciosGrupos.at(index).patchValue({ grupo: null });
    this.cargarGruposDeEspacioAcademico(espacioSeleccionado, index).subscribe(
      (grupos) => {
        this.gruposDeEspacioAcademico[index] = grupos;
      }
    );
  }

  cargarGruposDeEspacioAcademico(
    espacioAcademico: any,
    index: number
  ): Observable<any> {
    const periodoId = this.infoGrupoEstudio.periodo.Id;
    return this.espacioAcademicoService
      .get(
        `espacio-academico?query=activo:true,periodo_id:${periodoId},espacio_academico_padre:${espacioAcademico._id}`
      )
      .pipe(
        map((res: any) => {
          if (res.Success && res.Data.length > 0) {
            this.gruposDeEspacioAcademico[index] = res.Data;
            return res.Data;
          } else {
            this.popUpManager.showAlert(
              '',
              this.translate.instant(
                'gestion_horarios.espacio_academico_sin_grupos'
              )
            );
          }
        })
      );
  }

  agregarEspacioGrupo(): void {
    if (this.validarSelectsLlenos()) {
      this.listaEspaciosGrupos.push(this.crearGrupoForm());
    }
  }

  eliminarEspacioGrupo(index: number): void {
    this.listaEspaciosGrupos.removeAt(index);
  }

  //listaEspaciosGrupos: hace referencia a la lista de conjunto de selectes
  //                de espacio academico y grupo.
  get listaEspaciosGrupos(): FormArray {
    return this.formPaso1.get('espaciosGrupos') as FormArray;
  }

  crearGrupoForm(espacioAcademico: any = ''): FormGroup {
    return this.formBuilder.group({
      espacioAcademico: [espacioAcademico, Validators.required],
      grupo: ['', Validators.required],
    });
  }

  iniciarFormularios(): void {
    this.formPaso1 = this.formBuilder.group({
      espaciosGrupos: this.formBuilder.array([this.crearGrupoForm()]),
    });
    this.formPaso2 = this.formBuilder.group({
      codigoProyecto: ['', Validators.required],
      indicador: ['', Validators.required],
      codigoResultado: [{ value: '', disabled: true }, Validators.required],
      capacidad: ['', Validators.required],
    });
    this.formPaso2.valueChanges.subscribe(() =>
      this.actualizarCodigoResultado()
    );
    this.inputsFormStepDos = inputsFormStepDos;
  }

  editarGrupoEstudio(): void {
    const grupoEstudio = this.construirObjetoGrupoEstudio();
    const grupoEstudioId = this.infoGrupoEstudio._id;

    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(
          'gestion_horarios.esta_seguro_editar_grupo_personas'
        )
      )
      .then((confirmado) => {
        if (confirmado.value) {
          this.horarioService
            .put(`grupo-estudio/${grupoEstudioId}`, grupoEstudio)
            .subscribe((res: any) => {
              if (res.Success) {
                this.popUpManager.showSuccessAlert(
                  this.translate.instant(
                    'gestion_horarios.grupo_personas_editado'
                  )
                );
                this.dialogRef.close(true);
              } else {
                this.popUpManager.showErrorAlert(
                  this.translate.instant(
                    'gestion_horarios.error_editar_grupo_personas'
                  )
                );
              }
            });
        }
      });
  }

  construirObjetoGrupoEstudio(): any {
    const idEspaciosAcademicosActivos = this.listaEspaciosGrupos.value.map(
      (espacioGrupo: any) => espacioGrupo.grupo._id
    );

    const idEspaciosAcademicosDesactivos =
      this.infoGrupoEstudio.EspaciosAcademicos.desactivos.map(
        (grupo: any) => grupo._id
      );

    const idEspaciosAcademicos: any[] = [
      ...idEspaciosAcademicosActivos,
      ...idEspaciosAcademicosDesactivos,
    ];

    return {
      CodigoProyecto: this.formPaso2.get('codigoProyecto')?.value,
      IndicadorGrupo: this.formPaso2.get('indicador')?.value,
      CuposGrupos: this.formPaso2.get('capacidad')?.value,
      EspaciosAcademicos: idEspaciosAcademicos,
      Activo: true,
    };
  }

  actualizarCodigoResultado(): void {
    const codigoProyecto = this.formPaso2.get('codigoProyecto')?.value || '';
    const indicador = this.formPaso2.get('indicador')?.value || '';
    this.formPaso2
      .get('codigoResultado')
      ?.setValue(`${codigoProyecto} ${indicador}`, { emitEvent: false });
  }

  validarSelectsLlenos(): boolean {
    return this.listaEspaciosGrupos.controls.every((group) => group.valid);
  }

  verificarSiGrupoYaFueAgregado(grupo: any, index: any) {
    console.log(grupo);
    const yaEsta = this.idGruposYaSeleccionados.includes(grupo.value._id);

    if (yaEsta) {
      const grupoForm = this.listaEspaciosGrupos.at(index) as FormGroup;
      grupoForm.get('grupo')?.reset();
      this.popUpManager.showAlert(
        '',
        this.translate.instant('gestion_horarios.grupo_ya_seleccionado')
      );
    }
    this.idGruposYaSeleccionados.push(grupo.value._id);
  }

  abrirDialogoCrearEspacioGrupo(espacioAcademico: any, index: any) {
    const dialogRef = this.dialog.open(CrearEspacioGrupoDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        espacioAcademico: espacioAcademico,
        periodo: this.infoGrupoEstudio.periodo,
      },
    });

    dialogRef.afterClosed().subscribe((grupoEspacio) => {
      if (grupoEspacio && grupoEspacio.creado) {
        this.cargarGruposDeEspacioAcademico(
          { _id: grupoEspacio.info.espacio_academico_padre },
          index
        ).subscribe((grupos) => {
          this.gruposDeEspacioAcademico[index] = grupos;
        });
      }
    });
  }

  abrirDialogoVerEspaciosDesactivos() {
    const dialogRef = this.dialog.open(DialogoVerEspaciosDesactivosComponent, {
      width: '65%',
      height: 'auto',
      data: this.infoGrupoEstudio,
    });

    dialogRef.afterClosed().subscribe((gruposActivados) => {
      if (gruposActivados) {
        this.dialogRef.close(true);
      }
    });
  }
}
