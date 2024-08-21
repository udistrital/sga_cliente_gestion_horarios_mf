import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { inputsFormStepDos } from './utilidades';
import { HorarioService } from '../../../../../../services/horario.service';
import { Parametros } from '../../../../../../../utils/Parametros';
import { firstValueFrom, map, Observable } from 'rxjs';

@Component({
  selector: 'udistrital-crear-grupo-dialog',
  templateUrl: './crear-grupo-dialog.component.html',
  styleUrl: './crear-grupo-dialog.component.scss'
})
export class CrearGrupoDialogComponent implements OnInit {
  espaciosAcademicos: any;
  inputsFormStepDos!: any;
  formPaso1!: FormGroup;
  formPaso2!: FormGroup;
  gruposDeEspacioAcademico: any[] = [];
  grupoEstudio: any
  idGrupos: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CrearGrupoDialogComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioService: HorarioService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    console.log(this.dataEntrante)
    this.iniciarFormularios();
    this.obtenerMateriasSegunPlanYSemestre();
  }

  obtenerMateriasSegunPlanYSemestre(): void {
    this.parametros.obtenerMateriasSegunPlanYSemestre(this.dataEntrante.planEstudio, this.dataEntrante.semestre.NumeroOrden).subscribe(res => {
      this.espaciosAcademicos = res;
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

  cargarGruposDeEspacioAcademico(espacioAcademico: any, index: number): void {
    const periodoId =  this.dataEntrante.periodo.Id
    this.espacioAcademicoService.get(`espacio-academico?query=activo:true,periodo_id:${periodoId},espacio_academico_padre:${espacioAcademico._id}`).subscribe((res: any) => {
      if(res.Success && res.Data.length > 0){
        this.gruposDeEspacioAcademico[index] = res.Data;
      }else{
        this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.espacio_academico_sin_grupos"));
      }
    });
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

  crearGrupoForm(): FormGroup {
    return this.formBuilder.group({
      espacioAcademico: ['', Validators.required],
      grupo: ['', Validators.required]
    });
  }

  crearGrupoEstudio(): void {
    this.construirObjetoGrupoEstudio().subscribe((grupoEstudio: any) => {
      this.popUpManager.showConfirmAlert("", this.translate.instant("gestion_horarios.esta_seguro_crear_grupo_personas")).then(confirmado => {
        if (!confirmado.value) {return}
        this.horarioService.post("grupo-estudio", grupoEstudio).subscribe((res: any) => {
          if (res.Success) {
            this.popUpManager.showSuccessAlert(this.translate.instant("gestion_horarios.grupo_personas_creado"));
            this.dialogRef.close(true);
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant("gestion_horarios.error_crear_grupo_personas"));
          }
        });
      });
    })

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

  construirObjetoGrupoEstudio(): any {
    const { horario, semestre } = this.dataEntrante;
    const idEspaciosAcademicos = this.espaciosGrupos.value.map((espacioGrupo: any) => espacioGrupo.grupo._id);
    return this.horarioService.get("estado-creacion-semestre?query=Nombre:Aprobado&fields=_id").pipe(
      map((res: any) => ({
        CodigoProyecto: this.formPaso2.get('codigoProyecto')?.value,
        IndicadorGrupo: this.formPaso2.get('indicador')?.value,
        CuposGrupos: this.formPaso2.get('capacidad')?.value,
        EspaciosAcademicos: idEspaciosAcademicos,
        SemestreId: semestre.Id,
        HorarioId: horario._id,
        EstadoCreacionSemestreId: res.Data[0]._id,
        Observacion: "Vacio",
        Activo: true
      })));
  }

}
