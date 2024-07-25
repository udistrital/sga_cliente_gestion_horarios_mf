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
  
  // consultarExistenciaDeHorarioSemestre() {
  //   const semestre = this.formSemestre.get('semestre')?.value;
  //   this.banderaBotonCrearGrupo = true
  //   this.gestionExistenciaHorario.gestionarHorarioSemestre(this.horarioPadre, semestre, this.dataParametrica.periodo.Id, this.popUpManager, this.translate, (horarioSemestre: any) => {
  //     if (horarioSemestre) {
  //       console.log(horarioSemestre)
  //       this.horarioHijo = horarioSemestre;
  //       this.listarGruposEstudioSegunParametros();
  //       this.banderaBotonCrearGrupo = true
  //     } else {
  //       this.formSemestre.patchValue({
  //         semestre: null
  //       });
  //       this.banderaTablaGrupos = false
  //       this.banderaBotonCrearGrupo = false
  //     }
  //   });
  // }
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
      "Id": 40,
      "Nombre": "2024-1",
      "Descripcion": "Periodo académico 2024-1",
      "Year": 2024,
      "Ciclo": "1",
      "CodigoAbreviacion": "PA",
      "Activo": false,
      "AplicacionId": 41,
      "InicioVigencia": "2023-09-01T00:00:00Z",
      "FinVigencia": "2024-07-17T00:00:00Z",
      "FechaCreacion": "2023-10-17 16:48:09.892758 +0000 +0000",
      "FechaModificacion": "2024-05-23 12:44:06.367729 +0000 +0000"
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