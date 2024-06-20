import { Component, Input, OnInit } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../../models/diccionario/diccionario';
//import { LocalDataSource } from 'ng2-smart-table';
import { HttpErrorResponse } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../../theme/ng2-st-button/ng2-st-button.component';
import { FormGroup } from '@angular/forms';
import { ProyectoAcademicoService } from '../../../../services/proyecto_academico.service';
import { ParametrosService } from '../../../../services/parametros.service';

@Component({
  selector: 'udistrital-gestion-grupos',
  templateUrl: './gestion-grupos.component.html',
  styleUrl: './gestion-grupos.component.scss'
})
export class GestionGruposComponent {

  @Input() dataParametrica: any;

  formStep1!: FormGroup;

  constructor(
    private translate: TranslateService,
    ) {
    }

  ngOnInit() {
    
    console.log(this.dataParametrica)
  }
 
  to_main_component(){
  }
}


function obtenerDatos(){
  return{
    "nivel": {
      "Id": 2,
      "Nombre": "Posgrado",
      "Descripcion": "Posgrado",
      "CodigoAbreviacion": "POS",
      "Activo": true,
      "NumeroOrden": 2,
      "FechaCreacion": "2019-11-15 00:43:28.591057 +0000 +0000",
      "FechaModificacion": "2019-11-15 00:43:28.591057 +0000 +0000",
      "NivelFormacionPadreId": null
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
      "AnoResolucion": 1988,
      "Codigo": "788",
      "CodigoAbreaviacion": "",
      "EsPlanEstudioPadre": true,
      "EspaciosSemestreDistribucion": "",
      "EstadoAprobacionId": {
        "Id": 1,
        "Nombre": "En Edición",
        "Descripcion": "En edición",
        "CodigoAbreviacion": "ED",
        "Activo": true
      },
      "FechaCreacion": "2024-02-26 19:22:46.098028 +0000 +0000",
      "FechaModificacion": "2024-04-08 09:21:06.3088 +0000 +0000",
      "Id": 52,
      "Nombre": "Plan 2 ciclo",
      "NumeroResolucion": 47,
      "NumeroSemestres": 3,
      "Observacion": "",
      "ProyectoAcademicoId": 30,
      "ResumenPlanEstudios": "",
      "RevisorId": 0,
      "RevisorRol": "",
      "SoporteDocumental": "{\"SoporteDocumental\":[151730]}",
      "TotalCreditos": 40
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
      "CodigoAbreviacion": "1ERS",
      "Descripcion": "Primer semestre",
      "FechaCreacion": "2024-06-18 14:49:57.465242 +0000 +0000",
      "FechaModificacion": "2024-06-18 14:54:18.418942 +0000 +0000",
      "Id": 6507,
      "Nombre": "Primer semestre",
      "NumeroOrden": 1,
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