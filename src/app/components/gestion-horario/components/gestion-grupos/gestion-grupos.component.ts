import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CrearGrupoDialogComponent } from './components/crear-grupo-dialog/crear-grupo-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { gruposEstudioContructorTabla } from './utilidades';
import { EditarGrupoDialogComponent } from './components/editar-grupo-dialog/editar-grupo-dialog.component';
import { PopUpManager } from '../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { HorarioService } from '../../../../services/horario.service';
import { Parametros } from '../../../../../utils/Parametros';
import { GestionExistenciaHorarioService } from '../../../../services/gestion-existencia-horario.service';

@Component({
  selector: 'udistrital-gestion-grupos',
  templateUrl: './gestion-grupos.component.html',
  styleUrl: './gestion-grupos.component.scss'
})

export class GestionGruposComponent {

  gruposEstudioContructorTabla: any

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() dataParametrica: any;
  @Output() volverASelects = new EventEmitter<boolean>();

  banderaTablaGrupos: boolean = false
  gruposEstudio: any
  horario: any
  semestres: any
  tablaColumnas: any

  formSemestre!: FormGroup;
  banderaBotonCrearGrupo: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private horarioMid: HorarioMidService,
    private horarioService: HorarioService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.iniciarFormSemestre()
    this.dataParametrica = datosPrueba()
    this.cargarSemestresSegunPlanEstudio(this.dataParametrica.planEstudio)
    console.log(this.dataParametrica)
  }

  listarGruposEstudioSegunParametros() {
    this.banderaBotonCrearGrupo = true
    const horarioId = this.horario._id
    const semestre = this.formSemestre.get('semestre')?.value;
    this.horarioMid.get("grupo-estudio?horario-id=" + horarioId + "&semestre-id=" + semestre.Id).subscribe((res: any) => {
      if (res.Success) {
        if (res.Data.length > 0) {
          this.gruposEstudio = res.Data
          this.construirTabla()
          this.dataParametrica.semestre = this.formSemestre.get('semestre')?.value
          this.banderaTablaGrupos = true
        } else {
          this.popUpManager.showAlert("", this.translate.instant("GLOBAL.no_informacion_registrada"))
          this.banderaTablaGrupos = false
        }
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant("GLOBAL.error"))
      }
    })
  }

  construirTabla() {
    this.gruposEstudioContructorTabla = gruposEstudioContructorTabla
    this.tablaColumnas = this.gruposEstudioContructorTabla.map((column: any) => column.columnDef);
    //Asigna la info a la tabla
    this.gruposEstudio = new MatTableDataSource(this.gruposEstudio);
    this.gruposEstudio.paginator = this.paginator;
  }

  abrirDialogoCrearGrupo() {
    const dialogRef = this.dialog.open(CrearGrupoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data: {
        ...this.dataParametrica,
        horarioPadre: this.horario,
        semestre: this.formSemestre.get("semestre")!.value
      }
    });

    dialogRef.afterClosed().subscribe((grupoCreado) => {
      if (grupoCreado) {
        this.listarGruposEstudioSegunParametros()
      }
    });
  }

  abrirDialogoEditarGrupo(grupo: any) {
    grupo.proyecto = this.dataParametrica.proyecto
    grupo.planEstudio = this.dataParametrica.planEstudio
    grupo.semestre = this.dataParametrica.semestre

    const dialogRef = this.dialog.open(EditarGrupoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data: grupo
    });

    dialogRef.afterClosed().subscribe((grupoEditado) => {
      if (grupoEditado) {
        this.listarGruposEstudioSegunParametros()
      }
    });
  }

  eliminarGrupoEstudio(grupo: any) {
    const grupoId = grupo._id;
    console.log(grupoId)
    this.popUpManager.showConfirmAlert("", this.translate.instant("gestion_horarios.esta_seguro_eliminar_grupo_personas")).then(confirmado => {
      if (confirmado.value) {
        this.horarioService.delete("grupo-estudio", grupoId).subscribe((res: any) => {
          if (res.Success) {
            this.listarGruposEstudioSegunParametros()
            this.popUpManager.showSuccessAlert(this.translate.instant("gestion_horarios.grupo_personas_eliminado"))
          } else {
            this.popUpManager.showAlert("", this.translate.instant("GLOBAL.error"))
          }
        })
      }
    })
  }

  buscarGrupoEstudio(event: Event) {
    const valorFiltro = (event.target as HTMLInputElement).value;
    this.gruposEstudio.filter = valorFiltro.trim().toLowerCase();
  }

  volverASelectsParametrizables() {
    this.volverASelects.emit(true)
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros.semestresSegunPlanEstudio(planEstudio).subscribe((res: any) => {
      this.semestres = res
      this.consultarExistenciaDeHorario()
    })
  }

  iniciarFormSemestre() {
    this.formSemestre = this._formBuilder.group({
      semestre: ['', Validators.required],
    })
  }

  consultarExistenciaDeHorario() {
    this.gestionExistenciaHorario.gestionarHorario(this.dataParametrica, this.semestres, this.popUpManager, this.translate, (horario: any) => {
      if (horario) {
        this.horario = horario;
      } else {
        this.volverASelectsParametrizables();
      }
    });
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
      "Activo": true,
      "AplicacionId": 41,
      "Ciclo": "1",
      "CodigoAbreviacion": "PA",
      "Descripcion": "Periodo académico 2022-1",
      "FechaCreacion": "2022-03-11 11:18:15.094268 +0000 +0000",
      "FechaModificacion": "2024-06-21 08:30:12.060977 +0000 +0000",
      "FinVigencia": "2022-06-30T00:00:00Z",
      "Id": 31,
      "InicioVigencia": "2022-03-08T00:00:00Z",
      "Nombre": "2022-1",
      "Year": 2022
    },
    "planEstudio": {
      "Activo": true,
      "AnoResolucion": 2021,
      "Codigo": "123",
      "CodigoAbreaviacion": "",
      "EsPlanEstudioPadre": false,
      "EspaciosSemestreDistribucion": "{\"semestre_1\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"64935cac85308dfabd19a938\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}}]},\"semestre_2\":{\"espacios_academicos\":[{\"espacio_1\":{\"Id\":\"64935cf285308d74f119a93c\",\"OrdenTabla\":1,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}},{\"espacio_2\":{\"Id\":\"64935d4d85308d4a7019a940\",\"OrdenTabla\":2,\"EspaciosRequeridos\":{\"Id\":\"NA\"}}}]}}",
      "EstadoAprobacionId": {
        "Id": 2,
        "Nombre": "Por Revisar",
        "Descripcion": "Por Revisar",
        "CodigoAbreviacion": "REV",
        "Activo": true
      },
      "FechaCreacion": "2023-08-25 11:05:51.30267 +0000 +0000",
      "FechaModificacion": "2023-11-07 20:42:49.05516 +0000 +0000",
      "Id": 1,
      "Nombre": "Plan de estudio Prueba",
      "NumeroResolucion": 123,
      "NumeroSemestres": 8,
      "Observacion": "",
      "ProyectoAcademicoId": 31,
      "ResumenPlanEstudios": "{\"nombre\":\"TOTAL\",\"creditos\":8,\"htd\":144,\"htc\":96,\"hta\":144,\"OB\":0,\"OC\":0,\"EI\":0,\"EE\":0,\"CP\":0,\"ENFQ_TEO\":3,\"ENFQ_PRAC\":0,\"ENFQ_TEOPRAC\":0,\"numero_semestres\":2}",
      "RevisorId": 0,
      "RevisorRol": "",
      "SoporteDocumental": "{\"SoporteDocumental\":[150561,150562]}",
      "TotalCreditos": 164
    },
    "proyecto": {
      "Activo": true,
      "AnoActoAdministrativo": "2020",
      "AreaConocimientoId": 7,
      "CiclosPropedeuticos": false,
      "Codigo": "125",
      "CodigoAbreviacion": "MAESINGINDUS",
      "CodigoSnies": "234567",
      "Competencias": "Maestria en Ingenieria Industrial",
      "CorreoElectronico": "maestriaingindust@correo.com",
      "DependenciaId": 623,
      "Duracion": 10,
      "EnlaceActoAdministrativo": "2493",
      "FacultadId": 14,
      "FechaCreacion": "2021-08-04 20:48:47.852479 +0000 +0000",
      "FechaModificacion": "2023-06-21 15:19:08.690044 +0000 +0000",
      "Id": 31,
      "MetodologiaId": {
        "Id": 1,
        "Nombre": "Presencial",
        "Descripcion": "Presencial",
        "CodigoAbreviacion": "PRE",
        "Activo": true
      },
      "ModalidadId": null,
      "NivelFormacionId": {
        "Id": 7,
        "Nombre": "Maestria",
        "Descripcion": "maestria",
        "CodigoAbreviacion": "MAS",
        "Activo": true
      },
      "Nombre": "Maestría en Ingeniería Industrial",
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
      "CodigoAbreviacion": "MAS",
      "Descripcion": "maestria",
      "FechaCreacion": "2021-01-05 17:14:35.50068 +0000 +0000",
      "FechaModificacion": "2021-01-05 17:14:35.50068 +0000 +0000",
      "Id": 7,
      "NivelFormacionPadreId": {
        "Id": 2,
        "Nombre": "Posgrado",
        "Descripcion": "Posgrado",
        "CodigoAbreviacion": "POS",
        "Activo": true
      },
      "Nombre": "Maestria",
      "NumeroOrden": 7
    }
  }
  
}