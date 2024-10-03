import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { inputsFormDocente } from './utilidades';
import { HorarioMidService } from '../../../../../../../../services/horario-mid.service';
import { PopUpManager } from '../../../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { TrabajoDocenteService } from '../../../../../../../../services/trabajo-docente.service';

@Component({
  selector: 'udistrital-detalle-espacio-dialog',
  templateUrl: './detalle-espacio-dialog.component.html',
  styleUrl: './detalle-espacio-dialog.component.scss',
})
export class DetalleEspacioDialogComponent implements OnInit {
  actividadGestionPlanDocente: any;
  planDocenteId: any;
  inputsFormDocente: any;
  banderaAsignarDocente: boolean = false;
  docente: any;
  vinculacionesDocente: any;

  formDocente!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoEspacio: any,
    public dialogRef: MatDialogRef<DetalleEspacioDialogComponent>
  ) {}

  ngOnInit() {}
}
