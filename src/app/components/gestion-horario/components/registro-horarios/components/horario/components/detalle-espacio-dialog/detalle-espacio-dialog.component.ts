import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { inputsFormDocente } from './utilidades';
import { HorarioMidService } from '../../../../../../../../services/horario-mid.service';
import { PopUpManager } from '../../../../../../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'udistrital-detalle-espacio-dialog',
  templateUrl: './detalle-espacio-dialog.component.html',
  styleUrl: './detalle-espacio-dialog.component.scss'
})
export class DetalleEspacioDialogComponent implements OnInit {

  inputsFormDocente: any
  banderaAsignarDocente: boolean = false
  docente: any
  vinculacionesDocente: any

  formDocente!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoEspacio: any,
    private _formBuilder: FormBuilder,
    private horarioMid: HorarioMidService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.iniciarFormDocente()
    console.log(this.infoEspacio)
  }

  asignarDocente() {

  }

  cargarDatosDocente(documento: string) {
    this.vinculacionesDocente = []
    this.horarioMid.get("docente/vinculaciones?documento=" + documento).subscribe((res: any) => {
      if (res.Data && res.Status == "200") {
        const data = res.Data
        this.docente = data.Docente
        this.formDocente.patchValue({
          nombreDocente: data.Docente.Nombre
        })
        this.vinculacionesDocente = data.Vinculaciones
      } else if (res.Message == "No hay docente con el documento dado") {
        this.formDocente.reset()
        this.popUpManager.showAlert('', this.translate.instant('ptd.no_docente_encontrado'))
      } else if (res.Message == "El docente no tiene vinculaciones") {
        this.formDocente.reset()
        this.popUpManager.showAlert('', this.translate.instant('ptd.no_vinculacion_docente'))
      }
    })
  }

  iniciarFormDocente() {
    this.formDocente = this._formBuilder.group({
      documento: ['', Validators.required],
      nombreDocente: [{ value: '', disabled: true }, Validators.required],
      vinculacion: ['', Validators.required],
    });
    this.inputsFormDocente = inputsFormDocente
  }
}
