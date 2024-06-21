import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'udistrital-crear-grupo-dialog',
  templateUrl: './crear-grupo-dialog.component.html',
  styleUrl: './crear-grupo-dialog.component.scss'
})
export class CrearGrupoDialogComponent implements OnInit {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  formStepUno!: FormGroup;
  espaciosAcademicos: any;
  gruposDeEspacioAcademico: any;
  espacioGrupoSeleccionados: any[] = []; 


  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CrearGrupoDialogComponent>,
    private espacioAcademicoService: EspacioAcademicoService,
    private fb: FormBuilder,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    // todo cambiar
    // this.espaciosAcademicos = this.dataEntrante.espaciosAcademicosDelSemestre;
    this.espaciosAcademicos = datosPrueba().espaciosAcademicosDelSemestre
    this.iniciarFormularioPasoUno()
  }


  cargarGruposDeEspacioAcademico(espacioAcademico: any) {
    const idEspacioAcademico = espacioAcademico._id;
    this.espacioAcademicoService.get("espacio-academico?query=espacio_academico_padre:" + idEspacioAcademico).subscribe(
      (res: any) => {
        // todo manejor de error cuando el endpoint en el back se arrgle (endpoint get(@query))
          this.gruposDeEspacioAcademico = res.Data; 
      }
    );
  }
  
  agregarEspacioGrupo(){
    //todo verificacion cuando no
    if(this.formStepUno.valid){
      const grupo = this.formStepUno.value
      this.espacioGrupoSeleccionados.push(grupo)
      console.log(this.espacioGrupoSeleccionados)
    }
  }

  iniciarFormularioPasoUno(){
    this.formStepUno = this.fb.group({
      espacioAcademico: ['', Validators.required],
      grupo: ['', Validators.required],
    });
  }



}

export function datosPrueba() {
  return {
    "dataParametrica": {
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
    },
    "espaciosAcademicosDelSemestre": [
      {
        "activo": true,
        "agrupacion_espacios_id": "6531d397432eff8154e285ce",
        "clasificacion_espacio_id": 791,
        "codigo": "CALC_III",
        "codigo_abreviacion": "CALC-MULT",
        "creditos": 2,
        "distribucion_horas": {
          "HTD": 24,
          "HTC": 48,
          "HTA": 24
        },
        "docente_id": 0,
        "enfoque_id": 4529,
        "espacio_academico_padre": null,
        "espacio_modular": false,
        "espacios_requeridos": ["647a1bbe85308d61ca199cda"],
        "estado_aprobacion_id": {
          "_id": "6478b92185308dc28b199b97",
          "nombre": "En Edición",
          "descripcion": "1er Estado aprobación para espacio académico",
          "codigo_abreviacion": "IN-EDIT",
          "activo": true
        },
        "fecha_creacion": "2023-06-02T16:55:41.325Z",
        "fecha_modificacion": "2023-11-08T01:52:09.586Z",
        "grupo": "Grupo1,",
        "horario_id": "0",
        "inscritos": 0,
        "lista_modular_docentes": [],
        "nombre": "Calculo Multivariable",
        "observacion": "En Edición",
        "periodo_id": 0,
        "plan_estudio_id": "1",
        "proyecto_academico_id": 30,
        "soporte_documental": [149263],
        "tipo_espacio_id": 4525,
        "__v": 0,
        "_id": "647a1f0d85308d1403199cf4"
      },
      {
        "activo": true,
        "agrupacion_espacios_id": "65309559432eff7413e28494",
        "clasificacion_espacio_id": 797,
        "codigo": "ax2",
        "codigo_abreviacion": "ax2",
        "creditos": 1,
        "distribucion_horas": {
          "HTA": 12,
          "HTC": 12,
          "HTD": 24
        },
        "docente_id": 0,
        "enfoque_id": 4529,
        "espacio_academico_padre": null,
        "espacio_modular": true,
        "espacios_requeridos": [],
        "estado_aprobacion_id": {
          "_id": "6478b92185308dc28b199b97",
          "nombre": "En Edición",
          "descripcion": "1er Estado aprobación para espacio académico",
          "codigo_abreviacion": "IN-EDIT",
          "activo": true
        },
        "fecha_creacion": "2023-10-20T19:37:34.092Z",
        "fecha_modificacion": "2023-10-20T19:37:34.092Z",
        "grupo": "Grupo1",
        "horario_id": "0",
        "inscritos": 0,
        "lista_modular_docentes": [],
        "nombre": "Asignatura x2",
        "observacion": "En Edición",
        "periodo_id": 0,
        "plan_estudio_id": "1",
        "proyecto_academico_id": 30,
        "soporte_documental": [151098],
        "tipo_espacio_id": 4525,
        "__v": 0,
        "_id": "6532d6fe432effe177e28735"
      }
    ]
  }
}
