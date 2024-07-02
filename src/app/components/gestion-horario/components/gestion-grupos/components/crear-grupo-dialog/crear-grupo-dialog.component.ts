import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { inputsFormStepDos } from './utilidades';
import { HorarioService } from '../../../../../../services/horario.service';
import { Parametros } from '../../../../../../../utils/Parametros';

@Component({
  selector: 'udistrital-crear-grupo-dialog',
  templateUrl: './crear-grupo-dialog.component.html',
  styleUrl: './crear-grupo-dialog.component.scss'
})
export class CrearGrupoDialogComponent implements OnInit {
  espaciosAcademicos: any;
  inputsFormStepDos!: any
  formPaso1!: FormGroup;
  formPaso2!: FormGroup;
  gruposDeEspacioAcademico: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CrearGrupoDialogComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioService: HorarioService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.obtenerMateriasSegunPlanYSemestre()
    this.iniciarFormularios()
  }

  obtenerMateriasSegunPlanYSemestre(){
    this.parametros.obtenerMateriasSegunPlanYSemestre(this.dataEntrante.planEstudio,this.dataEntrante.semestre.NumeroOrden).subscribe(res => {
      this.espaciosAcademicos = res
    })
  }

  iniciarFormularios() {
    this.iniciarForm1()
    this.iniciarForm2()
  }

  iniciarForm1() {
    this.formPaso1 = this._formBuilder.group({
      espaciosGrupos: this._formBuilder.array([this.crearGrupoForm()]),
    });
  }


  iniciarForm2() {
    this.formPaso2 = this._formBuilder.group({
      codigoProyecto: ['', Validators.required],
      indicador: ['', Validators.required],
      codigoResultado: [{ value: '', disabled: true }, Validators.required],
      capacidad: ['', Validators.required],
    });

    this.formPaso2.valueChanges.subscribe(() => {
      this.actualizarCodigoResultado();
    });
    this.inputsFormStepDos = inputsFormStepDos
  }
  
  cargarGruposDeEspacioAcademico(espacioAcademico: any, index: number) {
    const idEspacioAcademico = espacioAcademico._id;
    this.espacioAcademicoService.get("espacio-academico?query=espacio_academico_padre:" + idEspacioAcademico).subscribe(
      (res: any) => {
        this.gruposDeEspacioAcademico[index] = res.Data;
      }
    );
  }

  agregarEspacioGrupo() {
    //todo: validar grupos repetidos
    if (this.validarSelectsLlenos()) {
      this.espaciosGrupos.push(this.crearGrupoForm());
    }
  }

  eliminarEspacioGrupo(index: number) {
    this.espaciosGrupos.removeAt(index);
  }
  
  get espaciosGrupos(): FormArray {
    return this.formPaso1.get('espaciosGrupos') as FormArray;
  }

  crearGrupoForm(): FormGroup {
    return this._formBuilder.group({
      espacioAcademico: ['', Validators.required],
      grupo: ['', Validators.required],
    });
  }

  crearGrupoEstudio() {
    const grupoEstudio = this.construirObjetoGrupoEstudio()

    this.popUpManager.showConfirmAlert("", this.translate.instant("gestion_horarios.esta_seguro_crear_grupo_personas")).then(confirmado => {
      if(confirmado.value){
        this.horarioService.post("grupo-estudio", grupoEstudio).subscribe((res:any) => {
          if(res.Success){
            this.popUpManager.showSuccessAlert(this.translate.instant("gestion_horarios.grupo_personas_creado"))
            this.dialogRef.close(true)
          }else{
            this.popUpManager.showErrorAlert(this.translate.instant("gestion_horarios.error_crear_grupo_personas"))
          }
        })
      }
    })
  }

  construirObjetoGrupoEstudio() {
    let idEspaciosAcademicos: any[] = [];
    for (let espacioGrupo of this.formPaso1.value.espaciosGrupos) {
      idEspaciosAcademicos.push(espacioGrupo.grupo._id);
    }

    const grupoEstudio = {
      "CodigoProyecto": this.formPaso2.get('codigoProyecto')?.value,
      "IndicadorGrupo": this.formPaso2.get('indicador')?.value,
      "CuposGrupos": this.formPaso2.get('capacidad')?.value,
      "EspaciosAcademicos": idEspaciosAcademicos,
      "ProyectoAcademicoId": this.dataEntrante.proyecto.Id,
      "PlanEstudiosId": this.dataEntrante.planEstudio.Id,
      "SemestreId": this.dataEntrante.semestre.Id,
      "Activo": true,
    }

    return grupoEstudio;
  }

  actualizarCodigoResultado() {
    const codigoProyecto = this.formPaso2.get('codigoProyecto')?.value || '';
    const indicador = this.formPaso2.get('indicador')?.value || '';
    const codigoResultado = codigoProyecto + " " + indicador;
    this.formPaso2.get('codigoResultado')?.setValue(codigoResultado, { emitEvent: false });
  }

  validarSelectsLlenos(): boolean {
    return this.espaciosGrupos.controls.every(group => group.valid);
  }
}