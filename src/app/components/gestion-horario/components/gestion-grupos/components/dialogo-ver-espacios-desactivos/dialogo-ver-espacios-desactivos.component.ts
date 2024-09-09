import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { espaciosDesactivosContructorTabla } from './utiladades';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ordenarPorPropiedad } from '../../../../../../../utils/listas';
import { EspacioAcademicoMidService } from '../../../../../../services/espacio-academico-mid.service';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../../../managers/popUpManager';

@Component({
  selector: 'udistrital-dialogo-ver-espacios-desactivos',
  templateUrl: './dialogo-ver-espacios-desactivos.component.html',
  styleUrl: './dialogo-ver-espacios-desactivos.component.scss',
})
export class DialogoVerEspaciosDesactivosComponent implements OnInit {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  espaciosDesactivos: MatTableDataSource<any> = new MatTableDataSource();
  espaciosDesactivosContructorTabla: any;
  espaciosParaActivar: any[] = [];
  tablaColumnas: any;

  constructor(
    public dialogRef: MatDialogRef<DialogoVerEspaciosDesactivosComponent>,
    @Inject(MAT_DIALOG_DATA) public infoGrupo: any,
    private espacioAcademicoMid: EspacioAcademicoMidService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.construirTabla();
    console.log(this.infoGrupo.EspaciosAcademicos.desactivos);
  }

  construirTabla() {
    this.espaciosDesactivosContructorTabla = espaciosDesactivosContructorTabla;
    this.tablaColumnas = this.espaciosDesactivosContructorTabla.map(
      (column: any) => column.columnDef
    );
    //Asigna la info a la tabla
    this.espaciosDesactivos = new MatTableDataSource(
      ordenarPorPropiedad(
        this.infoGrupo.EspaciosAcademicos.desactivos,
        'grupo',
        1
      )
    );
  }

  activarDesactivarGrupo(event: MatSlideToggleChange, grupo: any) {
    if (event.checked) {
      this.espaciosParaActivar.push(grupo._id);
    } else {
      this.espaciosParaActivar = this.espaciosParaActivar.filter(
        (id) => id !== grupo._id
      );
    }
  }

  preguntarActivadoGruposSeleccionados() {
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant(
          'gestion_horarios.esta_seguro_activar_espacios_seleccionados'
        )
      )
      .then((confirmado) => {
        if (confirmado.value) {
          this.activarGruposSeleccionados();
        }
      });
  }

  activarGruposSeleccionados() {
    const solicitudes = this.espaciosParaActivar.map((idEspacio: any) => {
      return this.espacioAcademicoMid.get(
        `espacios-academicos/activar/${idEspacio}`
      );
    });

    forkJoin(solicitudes).subscribe({
      next: () => {
        this.popUpManager.showSuccessAlert(
          this.translate.instant(
            'gestion_horarios.se_activaron_espacios_seleccionados'
          )
        );
        this.dialogRef.close(true);
      },
    });
  }
}
