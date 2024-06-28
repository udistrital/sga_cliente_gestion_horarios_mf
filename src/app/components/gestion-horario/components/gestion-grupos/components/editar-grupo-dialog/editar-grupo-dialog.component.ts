import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, forkJoin, map } from 'rxjs';
import { inputsFormStepDos } from './utilidades';
import { HorarioService } from '../../../../../../services/horario.service';

@Component({
  selector: 'udistrital-editar-grupo-dialog',
  templateUrl: './editar-grupo-dialog.component.html',
  styleUrl: './editar-grupo-dialog.component.scss'
})
export class EditarGrupoDialogComponent implements OnInit {
  formPaso1!: FormGroup;
  formPaso2!: FormGroup;
  espaciosAcademicos: any;
  gruposDeEspacioAcademico: any[] = [];

  inputsFormStepDos!: any

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarGrupoDialogComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioService: HorarioService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.obtenerMateriasSegunPlanYSemestre().subscribe(res => {
      this.espaciosAcademicos = res
    })
    this.iniciarFormularios()
    this.cargarDatosGrupo(this.dataEntrante)
  }

  get espaciosGrupos(): FormArray {
    return this.formPaso1.get('espaciosGrupos') as FormArray;
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

  crearGrupoForm(): FormGroup {
    return this._formBuilder.group({
      espacioAcademico: ['', Validators.required],
      grupo: ['', Validators.required],
    });
  }

  iniciarFormularios(){
    this.iniciarFormPaso1()
    this.iniciarFormPaso2()
  }

  iniciarFormPaso1() {
    this.formPaso1 = this._formBuilder.group({
      espaciosGrupos: this._formBuilder.array([this.crearGrupoForm()]),
    });
  }


  iniciarFormPaso2() {
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

  crearGrupoEstudio() {
    const grupoEstudio = this.construirObjetoGrupoEstudio()
    const grupoEstudioId = this.dataEntrante._id

    this.popUpManager.showConfirmAlert("", this.translate.instant("gestion_horarios.esta_seguro_editar_grupo_personas")).then(confirmado => {
      if(confirmado.value){
        this.horarioService.put("grupo-estudio/" + grupoEstudioId, grupoEstudio).subscribe((res:any) => {
          if(res.Success){
            this.popUpManager.showSuccessAlert(this.translate.instant("gestion_horarios.grupo_personas_editado"))
            this.dialogRef.close(true)
          }else{
            this.popUpManager.showErrorAlert(this.translate.instant("gestion_horarios.error_editar_grupo_personas"))
          }
        })
      }
    })
  }

  cargarDatosGrupo(grupo: any) {
    this.formPaso2.patchValue({
      codigoProyecto: grupo.CodigoProyecto,
      indicador: grupo.IndicadorGrupo,
      codigoResultado: grupo.CodigoProyecto + " " + grupo.IndicadorGrupo,
      capacidad: grupo.CuposGrupos
    });
  }
  
  construirObjetoGrupoEstudio(){
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

  obtenerMateriasSegunPlanYSemestre(): Observable<any[]> {
    const semestreNumero = this.dataEntrante.semestre.NumeroOrden;
    const semestreClave = `semestre_${semestreNumero}`;
    const espaciosDistribucion = JSON.parse(this.dataEntrante.planEstudio.EspaciosSemestreDistribucion);

    if (espaciosDistribucion.hasOwnProperty(semestreClave)) {
      const idEspaciosAcademicos = espaciosDistribucion[semestreClave].espacios_academicos;

      // Mapear los IDs de los espacios académicos
      const requests: Observable<any>[] = idEspaciosAcademicos.map((item: any, index: number) => {
        const espacio = item[`espacio_${index + 1}`];
        if (espacio.Id) {
          return this.espacioAcademicoService.get("espacio-academico/" + espacio.Id).pipe(
            map((res: any) => res.Data)
          );
        }
        return null;
      }).filter(Boolean) as Observable<any>[]; // Filtrar elementos nulos y convertir a Observable<any>[]

      // Combinar todas las solicitudes en paralelo usando forkJoin
      return forkJoin(requests);
    } else {
      return new Observable<any[]>((observer) => {
        observer.next([]);
        observer.complete(); // Si no hay espacios académicos, emitir un arreglo vacío
      });
    }
  }
}
