import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, forkJoin, map } from 'rxjs';
import { inputsFormStepDos } from './utilidades';
import { HorarioService } from '../../../../../../services/horario.service';
import { ParametrosService } from '../../../../../../services/parametros.service';
import { Parametros } from '../../../../../../../utils/Parametros';

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
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.iniciarFormularios()
    this.obtenerMateriasSegunPlanYSemestre()
  }

  get espaciosGrupos(): FormArray {
    return this.formPaso1.get('espaciosGrupos') as FormArray;
  }

  seleccionadoEspacioAcademico(espacioSeleccionado: any, index: number) {
    this.gruposDeEspacioAcademico[index] = []; // Vaciar el array de opciones
    this.espaciosGrupos.at(index).patchValue({
      grupo: null
    });
    this.cargarGruposDeEspacioAcademico(espacioSeleccionado, index).subscribe(
      (grupos: any) => {
        this.gruposDeEspacioAcademico[index] = grupos;
      }
    );
  }

  cargarGruposDeEspacioAcademico(espacioAcademico: any, index: number): Observable<any> {
    const idEspacioAcademico = espacioAcademico._id;
    return new Observable(observer => {
      this.espacioAcademicoService.get("espacio-academico?query=espacio_academico_padre:" + idEspacioAcademico).subscribe(
        (res: any) => {
          this.gruposDeEspacioAcademico[index] = res.Data;
          observer.next(res.Data); // Emitir datos obtenidos
          observer.complete(); // Completar el observable
        }
      );
    });
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

  iniciarFormularios() {
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
      if (confirmado.value) {
        this.horarioService.put("grupo-estudio/" + grupoEstudioId, grupoEstudio).subscribe((res: any) => {
          if (res.Success) {
            this.popUpManager.showSuccessAlert(this.translate.instant("gestion_horarios.grupo_personas_editado"))
            this.dialogRef.close(true)
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant("gestion_horarios.error_editar_grupo_personas"))
          }
        })
      }
    })
  }

  cargarDatosGrupo(){
    this.cargarDatosGrupoPasoUno(this.dataEntrante)
    this.cargarDatosGrupoPasoDos(this.dataEntrante)
  }

  cargarDatosGrupoPasoUno(grupo:any){
    const espaciosSeleccionados = grupo.EspaciosAcademicos;
    
    // Limpiar el FormArray para evitar duplicados al agregar nuevos espacios
    while (this.espaciosGrupos.length !== 0) {
      this.espaciosGrupos.removeAt(0);
    }
  
    // Usar un array para almacenar los observables de cargarGruposDeEspacioAcademico
    const observables = espaciosSeleccionados.map((espacio: any) => {
      const opcion = this.espaciosAcademicos.find((o: any) => o._id === espacio.espacio_academico_padre);
      if (opcion) {
        this.espaciosGrupos.push(this.crearGrupoForm()); // Agregar un nuevo control de grupo al FormArray
        this.espaciosGrupos.at(this.espaciosGrupos.length - 1).patchValue({
          espacioAcademico: opcion // Seleccionar el espacio académico correcto
        });
  
        return this.cargarGruposDeEspacioAcademico(opcion, this.espaciosGrupos.length - 1);
      } else {
        return null;
      }
    }).filter(Boolean); // Filtrar elementos nulos
  
    // Combinar todas las solicitudes en paralelo usando forkJoin
    forkJoin(observables).subscribe((respuestas: any) => {
      respuestas.forEach((grupos: any, index: number) => {
        const espacioSeleccionado = espaciosSeleccionados[index];
        const opcion2 = grupos.find((p: any) => p._id === espacioSeleccionado._id);
        if (opcion2) {
          this.espaciosGrupos.at(index).patchValue({
            grupo: opcion2 // Asignar el grupo correspondiente al espacio académico
          });
        }
      });
    });
  }

  cargarDatosGrupoPasoDos(grupo: any) {
    this.formPaso2.patchValue({
      codigoProyecto: grupo.CodigoProyecto,
      indicador: grupo.IndicadorGrupo,
      codigoResultado: grupo.CodigoProyecto + " " + grupo.IndicadorGrupo,
      capacidad: grupo.CuposGrupos
    });
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

  obtenerMateriasSegunPlanYSemestre(){
    this.parametros.obtenerMateriasSegunPlanYSemestre(this.dataEntrante.planEstudio,this.dataEntrante.semestre.NumeroOrden).subscribe(res => {
      this.espaciosAcademicos = res
      this.cargarDatosGrupo()
    })
  }
}