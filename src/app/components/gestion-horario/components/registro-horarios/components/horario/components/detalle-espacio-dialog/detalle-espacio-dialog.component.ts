import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'udistrital-detalle-espacio-dialog',
  templateUrl: './detalle-espacio-dialog.component.html',
  styleUrl: './detalle-espacio-dialog.component.scss',
})
export class DetalleEspacioDialogComponent implements OnInit {
  formDocente!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoEspacio: any,
    public dialogRef: MatDialogRef<DetalleEspacioDialogComponent>
  ) {}

  ngOnInit() {}
}
