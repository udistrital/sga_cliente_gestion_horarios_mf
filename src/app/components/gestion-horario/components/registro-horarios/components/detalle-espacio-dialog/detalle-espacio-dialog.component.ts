import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'udistrital-detalle-espacio-dialog',
  templateUrl: './detalle-espacio-dialog.component.html',
  styleUrl: './detalle-espacio-dialog.component.scss'
})
export class DetalleEspacioDialogComponent implements OnInit {

  infoEspacio: any

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataEntrante: any,
  ) { }

  ngOnInit(): void {
    this.infoEspacio = this.dataEntrante
  }

}
