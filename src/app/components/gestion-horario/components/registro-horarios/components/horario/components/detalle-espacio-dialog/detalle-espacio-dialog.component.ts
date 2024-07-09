import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'udistrital-detalle-espacio-dialog',
  templateUrl: './detalle-espacio-dialog.component.html',
  styleUrl: './detalle-espacio-dialog.component.scss'
})
export class DetalleEspacioDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoEspacio: any,
  ) { }

  ngOnInit() {
    console.log(this.infoEspacio)
  }

}
