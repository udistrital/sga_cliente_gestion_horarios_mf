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
  selector: 'udistrital-crear-grupo-dialog',
  templateUrl: './crear-grupo-dialog.component.html',
  styleUrl: './crear-grupo-dialog.component.scss'
})
export class CrearGrupoDialogComponent implements OnInit {
  formPaso1!: FormGroup;
  formPaso2!: FormGroup;
  espaciosAcademicos: any;
  gruposDeEspacioAcademico: any[] = [];

  inputsFormStepDos!: any

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CrearGrupoDialogComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioService: HorarioService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.obtenerMateriasSegunPlanYSemestre().subscribe(res => {
      this.espaciosAcademicos = res
    })
    this.iniciarFormularios()
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

export function datosPrueba() {
  return {
    "nivel": {
      "Activo": true,
      "CodigoAbreviacion": "POS",
      "Descripcion": "Posgrado",
      "FechaCreacion": "2019-11-15 00:43:28.591057 +0000 +0000",
      "FechaModificacion": "2019-11-15 00:43:28.591057 +0000 +0000",
      "Id": 2,
      "NivelFormacionPadreId": null,
      "Nombre": "Posgrado",
      "NumeroOrden": 2
    },
    "periodo": {
      "Activo": false,
      "AplicacionId": 41,
      "Ciclo": "2",
      "CodigoAbreviacion": "PA",
      "Descripcion": "Periodo académico 2024-2",
      "FechaCreacion": "2024-05-17 12:34:48.502181 +0000 +0000",
      "FechaModificacion": "2024-06-10 20:49:05.879567 +0000 +0000",
      "FinVigencia": "2024-05-24T00:00:00Z",
      "Id": 56,
      "InicioVigencia": "2024-05-15T00:00:00Z",
      "Nombre": "2024-2",
      "Year": 2024
    },
    "planEstudio": {
      "Activo": true,
      "AnoResolucion": 2023,
      "Codigo": "sdsd",
      "CodigoAbreaviacion": "",
      "EsPlanEstudioPadre": false,
      "EspaciosSemestreDistribucion": "{\"semestre_1\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"647a1bbe85308d61ca199cda\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":[\"6478c0d485308d4b79199bcd\"]}}},{\"espacio_2\":{\"Id\":\"647a22b485308d82e4199d01\",\"OrdenTabla\":2,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}},{\"espacio_3\":{\"Id\":\"647cc37385308dfbf9199f96\",\"OrdenTabla\":3,\"EspaciosRequeridos\":{\"Id\":[\"6478c10985308d236b199bd2\"]}}}]},\"semestre_2\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"647a1f0d85308d1403199cf4\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":[\"647a1bbe85308d61ca199cda\"]}}},{\"espacio_2\":{\"Id\":\"6532d6fe432effe177e28735\",\"OrdenTabla\":2,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}}]}}",
      "EstadoAprobacionId": {
        "Id": 1,
        "Nombre": "En Edición",
        "Descripcion": "En edición",
        "CodigoAbreviacion": "ED",
        "Activo": true
      },
      "FechaCreacion": "2024-02-18 10:11:39.955115 +0000 +0000",
      "FechaModificacion": "2024-02-18 10:15:27.84161 +0000 +0000",
      "Id": 14,
      "Nombre": "adsd",
      "NumeroResolucion": 223,
      "NumeroSemestres": 2,
      "Observacion": "",
      "ProyectoAcademicoId": 30,
      "ResumenPlanEstudios": "{\"nombre\":\"TOTAL\",\"creditos\":8,\"htd\":132,\"htc\":120,\"hta\":132,\"OB\":3,\"OC\":0,\"EI\":0,\"EE\":0,\"CP\":0,\"ENFQ_TEO\":4,\"ENFQ_PRAC\":0,\"ENFQ_TEOPRAC\":1,\"numero_semestres\":2}",
      "RevisorId": 0,
      "RevisorRol": "",
      "SoporteDocumental": "{\"SoporteDocumental\":[151599]}",
      "TotalCreditos": 122
    },
    "proyecto": {
      "Activo": true,
      "AnoActoAdministrativo": "2020",
      "AreaConocimientoId": 3,
      "CiclosPropedeuticos": false,
      "Codigo": "125",
      "CodigoAbreviacion": "DOCINTEREDU",
      "CodigoSnies": "34567",
      "Competencias": "Doctorado interinstitucional en educación",
      "CorreoElectronico": "docinterinsedu@correo.com",
      "DependenciaId": 125,
      "Duracion": 10,
      "EnlaceActoAdministrativo": "2491",
      "FacultadId": 17,
      "FechaCreacion": "2021-08-04 20:46:10.661809 +0000 +0000",
      "FechaModificacion": "2024-05-02 22:20:35.872675 +0000 +0000",
      "Id": 30,
      "MetodologiaId": {
        "Id": 1,
        "Nombre": "Presencial",
        "Descripcion": "Presencial",
        "CodigoAbreviacion": "PRE",
        "Activo": true
      },
      "ModalidadId": null,
      "NivelFormacionId": {
        "Id": 8,
        "Nombre": "Doctorado",
        "Descripcion": "doctorado",
        "CodigoAbreviacion": "DOC",
        "Activo": true
      },
      "Nombre": "Doctorado interinstitucional en educación",
      "NucleoBaseId": 9,
      "NumeroActoAdministrativo": 123,
      "NumeroCreditos": 60,
      "Oferta": true,
      "ProyectoPadreId": null,
      "UnidadTiempoId": 6
    },
    "semestre": {
      "Activo": true,
      "CodigoAbreviacion": "2DOS",
      "Descripcion": "Segundo semestre",
      "FechaCreacion": "2024-06-18 14:50:35.600869 +0000 +0000",
      "FechaModificacion": "2024-06-18 14:54:57.900294 +0000 +0000",
      "Id": 6508,
      "Nombre": "Segundo semestre",
      "NumeroOrden": 2,
      "ParametroPadreId": null,
      "TipoParametroId": {
        "Id": 107,
        "Nombre": "Semestre académico",
        "Descripcion": "Semestre académico",
        "CodigoAbreviacion": "SA",
        "Activo": true
      }
    },
    "subnivel": {
      "Activo": true,
      "CodigoAbreviacion": "DOC",
      "Descripcion": "doctorado",
      "FechaCreacion": "2021-01-05 17:14:35.503167 +0000 +0000",
      "FechaModificacion": "2021-01-05 17:14:35.503167 +0000 +0000",
      "Id": 8,
      "NivelFormacionPadreId": {
        "Id": 2,
        "Nombre": "Posgrado",
        "Descripcion": "Posgrado",
        "CodigoAbreviacion": "POS",
        "Activo": true
      },
      "Nombre": "Doctorado",
      "NumeroOrden": 8
    }
  }
}
