import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'udistrital-dialogo-lista-restricciones-copiado',
  templateUrl: './dialogo-lista-restricciones-copiado.component.html',
  styleUrl: './dialogo-lista-restricciones-copiado.component.scss',
})
export class DialogoListaRestriccionesCopiadoComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public infoCopiado: any) {}

  ngOnInit() {
    this.infoCopiado = datosPrueba();
    console.log(this.infoCopiado);
  }
}

export function datosPrueba() {
  return {
    colocacionesIds: [
      '66fdc550e47d7e1dd8dd1a2e',
      '66fabea6e47d7e1dd8dd1452',
      '66fc4eb7e47d7e1dd8dd191c',
      '66fe9fa7e47d7e1dd8dd1b3f',
    ],
    grupoEstudio: {
      Activo: true,
      CodigoProyecto: 'Grupo',
      CuposGrupos: 30,
      EspaciosAcademicos: {
        activos: [
          // Aquí puedes agregar detalles de los espacios académicos activos
        ],
        desactivos: [],
      },
      EstadoCreacionSemestreId: '66aea978a33ffd48fa9b88eb',
      FechaCreacion: '2024-10-04T19:24:45.684Z',
      FechaModificacion: '2024-10-04T19:24:45.684Z',
      HorarioId: '67002b84e47d7e1dd8dd1de7',
      IndicadorGrupo: '81',
      Nombre: 'Grupo 81',
      Observacion: 'Vacio',
      SemestreId: 6507,
      __v: 0,
      _id: '670040fde47d7e1dd8dd1dfd',
    },
  };
}
