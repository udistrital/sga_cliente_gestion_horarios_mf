import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
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

  gruposEstudio: any
  tablaColumnas: any

  formStep1!: FormGroup;

  constructor(
    public dialog: MatDialog,
    private horarioMid: HorarioMidService,
    private horarioService: HorarioService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.listarGruposEstudioSegunParametros()
  }

  listarGruposEstudioSegunParametros() {
    const { proyecto, planEstudio, semestre } = this.dataParametrica;
    const query = `proyecto-academico=${proyecto.Id}&plan-estudios=${planEstudio.Id}&semestre=${semestre.Id}&limit=0`;

    this.horarioMid.get(`grupo-estudio?${query}`).subscribe((res: any) => {
      if (res.Success) {
        if (res.Data.length > 0) {
          this.gruposEstudio = res.Data
          this.construirTabla()
        } else {
          this.popUpManager.showAlert("", this.translate.instant("GLOBAL.no_informacion_registrada"))
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
      data: this.dataParametrica
    });

    dialogRef.afterClosed().subscribe((grupoCreado) => {
      if (grupoCreado) {
        this.listarGruposEstudioSegunParametros()
        console.log(grupoCreado)
      }
    });
  }

  abrirDialogoEditarGrupo(grupo:any) {
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

  eliminarGrupoEstudio(grupo:any){
    const grupoId = grupo._id;
    console.log(grupoId)
    this.popUpManager.showConfirmAlert("", this.translate.instant("gestion_horarios.esta_seguro_eliminar_grupo_personas")).then(confirmado => {
    if(confirmado.value){
      this.horarioService.delete("grupo-estudio", grupoId).subscribe((res:any) => {
        if(res.Success){
          this.listarGruposEstudioSegunParametros()
          this.popUpManager.showSuccessAlert(this.translate.instant("gestion_horarios.grupo_personas_eliminado"))
        }else{
          this.popUpManager.showAlert("",this.translate.instant("GLOBAL.error"))
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
}