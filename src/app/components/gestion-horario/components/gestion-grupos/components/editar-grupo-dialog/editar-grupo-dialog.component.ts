import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin, map } from 'rxjs';
import { inputsFormStepDos } from './utilidades';
import { HorarioService } from '../../../../../../services/horario.service';
import { Parametros } from '../../../../../../../utils/Parametros';

@Component({
  selector: 'udistrital-editar-grupo-dialog',
  templateUrl: './editar-grupo-dialog.component.html',
  styleUrl: './editar-grupo-dialog.component.scss'
})
export class EditarGrupoDialogComponent implements OnInit {
  espaciosAcademicos: any;
  inputsFormStepDos!: any;
  formPaso1!: FormGroup;
  formPaso2!: FormGroup;
  gruposDeEspacioAcademico: any[] = [];
  idGrupos: any[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarGrupoDialogComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioService: HorarioService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.iniciarFormularios();
    this.obtenerMateriasSegunPlanYSemestre();
  }

  obtenerMateriasSegunPlanYSemestre(): void {
    this.parametros.obtenerMateriasSegunPlanYSemestre(this.dataEntrante.planEstudio, this.dataEntrante.semestre.NumeroOrden).subscribe(res => {
      this.espaciosAcademicos = res;
      this.cargarDatosGrupoParaEditar();
    });
  }

  cargarDatosGrupoParaEditar(): void {
    this.cargarDatosGrupoPasoUno(this.dataEntrante);
    this.cargarDatosGrupoPasoDos(this.dataEntrante);
  }

  cargarDatosGrupoPasoUno(grupo: any): void {
    this.espaciosGrupos.clear();
    const observables = grupo.EspaciosAcademicos.map((espacio: any) => {
      const opcion = this.espaciosAcademicos.find((op: any) => op._id === espacio.espacio_academico_padre);
      if (opcion) {
        this.espaciosGrupos.push(this.crearGrupoForm(opcion));
        return this.cargarGruposDeEspacioAcademico(opcion, this.espaciosGrupos.length - 1);
      }
      return null;
    }).filter(Boolean);

    forkJoin(observables).subscribe((respuestas:any) => {
      respuestas.forEach((grupos:any, index:any) => {
        const espacioSeleccionado = grupo.EspaciosAcademicos[index];
        const opcion = grupos.find((p: any) => p._id === espacioSeleccionado._id);
        if (opcion) {
          this.espaciosGrupos.at(index).patchValue({ grupo: opcion });
        }
      });
    });
  }

  cargarDatosGrupoPasoDos(grupo: any): void {
    this.formPaso2.patchValue({
      codigoProyecto: grupo.CodigoProyecto,
      indicador: grupo.IndicadorGrupo,
      codigoResultado: `${grupo.CodigoProyecto} ${grupo.IndicadorGrupo}`,
      capacidad: grupo.CuposGrupos
    });
  }

  seleccionadoEspacioAcademico(espacioSeleccionado: any, index: number): void {
    this.gruposDeEspacioAcademico[index] = [];
    this.espaciosGrupos.at(index).patchValue({ grupo: null });
    this.cargarGruposDeEspacioAcademico(espacioSeleccionado, index).subscribe(grupos => {
      this.gruposDeEspacioAcademico[index] = grupos;
    });
  }

  cargarGruposDeEspacioAcademico(espacioAcademico: any, index: number): Observable<any> {
    return this.espacioAcademicoService.get(`espacio-academico?query=espacio_academico_padre:${espacioAcademico._id}`).pipe(
      map((res:any) => {
        this.gruposDeEspacioAcademico[index] = res.Data;
        this.idGrupos.push(res.Data[0]._id)
        return res.Data;
      })
    );
  }

  agregarEspacioGrupo(): void {
    if (this.validarSelectsLlenos()) {
      this.espaciosGrupos.push(this.crearGrupoForm());
    }
  }

  eliminarEspacioGrupo(index: number): void {
    this.espaciosGrupos.removeAt(index);
  }

  get espaciosGrupos(): FormArray {
    return this.formPaso1.get('espaciosGrupos') as FormArray;
  }

  crearGrupoForm(espacioAcademico: any = ''): FormGroup {
    return this.formBuilder.group({
      espacioAcademico: [espacioAcademico, Validators.required],
      grupo: ['', Validators.required]
    });
  }

  iniciarFormularios(): void {
    this.formPaso1 = this.formBuilder.group({
      espaciosGrupos: this.formBuilder.array([this.crearGrupoForm()])
    });
    this.formPaso2 = this.formBuilder.group({
      codigoProyecto: ['', Validators.required],
      indicador: ['', Validators.required],
      codigoResultado: [{ value: '', disabled: true }, Validators.required],
      capacidad: ['', Validators.required]
    });
    this.formPaso2.valueChanges.subscribe(() => this.actualizarCodigoResultado());
    this.inputsFormStepDos = inputsFormStepDos;
  }

  editarGrupoEstudio(): void {
    const grupoEstudio = this.construirObjetoGrupoEstudio();
    const grupoEstudioId = this.dataEntrante._id;

    this.popUpManager.showConfirmAlert("", this.translate.instant("gestion_horarios.esta_seguro_editar_grupo_personas")).then(confirmado => {
      if (confirmado.value) {
        this.horarioService.put(`grupo-estudio/${grupoEstudioId}`, grupoEstudio).subscribe((res:any) => {
          if (res.Success) {
            this.popUpManager.showSuccessAlert(this.translate.instant("gestion_horarios.grupo_personas_editado"));
            this.dialogRef.close(true);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant("gestion_horarios.error_editar_grupo_personas"));
          }
        });
      }
    });
  }

  construirObjetoGrupoEstudio(): any {
    const idEspaciosAcademicos = this.espaciosGrupos.value.map((espacioGrupo: any) => espacioGrupo.grupo._id);
    return {
      CodigoProyecto: this.formPaso2.get('codigoProyecto')?.value,
      IndicadorGrupo: this.formPaso2.get('indicador')?.value,
      CuposGrupos: this.formPaso2.get('capacidad')?.value,
      EspaciosAcademicos: idEspaciosAcademicos,
      ProyectoAcademicoId: this.dataEntrante.proyecto.Id,
      PlanEstudiosId: this.dataEntrante.planEstudio.Id,
      SemestreId: this.dataEntrante.semestre.Id,
      Activo: true
    };
  }

  actualizarCodigoResultado(): void {
    const codigoProyecto = this.formPaso2.get('codigoProyecto')?.value || '';
    const indicador = this.formPaso2.get('indicador')?.value || '';
    this.formPaso2.get('codigoResultado')?.setValue(`${codigoProyecto} ${indicador}`, { emitEvent: false });
  }

  validarSelectsLlenos(): boolean {
    return this.espaciosGrupos.controls.every(group => group.valid);
  }

  verificarSiGrupoYaFueAgregado(grupo: any, index: any) {
    const yaEsta = this.idGrupos.includes(grupo.value._id);
    if (yaEsta) {
      const grupoForm = this.espaciosGrupos.at(index) as FormGroup;
      grupoForm.get('grupo')?.reset();
      this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.grupo_ya_seleccionado"));
    }
    this.idGrupos.push(grupo.value._id)
  }
}