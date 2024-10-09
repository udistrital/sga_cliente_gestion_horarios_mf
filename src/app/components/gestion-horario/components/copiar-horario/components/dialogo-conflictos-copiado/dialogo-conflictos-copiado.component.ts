import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { espaciosAcademicosContructorTabla } from './utilidades';
import { ordenarPorPropiedad } from '../../../../../../../utils/listas';
import { HorarioMidService } from '../../../../../../services/horario-mid.service';
import { EspacioAcademicoService } from '../../../../../../services/espacio-academico.service';
import { DialogoVerConflictosColocacionComponent } from '../dialogo-ver-conflictos-colocacion/dialogo-ver-conflictos-colocacion.component';

@Component({
  selector: 'udistrital-dialogo-lista-restricciones-copiado',
  templateUrl: './dialogo-conflictos-copiado.component.html',
  styleUrl: './dialogo-conflictos-copiado.component.scss',
})
export class DialogoConflictosCopiadoComponent implements OnInit {
  colocaciones: any;
  colocacionesContructorTabla: any;
  tablaColumnas: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoCopiado: any,
    public dialog: MatDialog,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioMid: HorarioMidService
  ) {}

  ngOnInit() {
    this.infoCopiado = datosPrueba();
    this.construirTabla();
    this.verificarConflictosHorario();
  }

  verificarConflictosHorario() {
    this.colocaciones.forEach((colocacion: any) => {
      this.verificarEspacioAcademicoExistente(colocacion);
      this.verificarConflictosGrupoEstudio(colocacion);
      this.verificarConflictosEspacioFisico(colocacion);
    });
  }

  verificarConflictosGrupoEstudio(colocacion: any) {
    const grupoEstudioId = this.infoCopiado.grupoEstudio._id;
    const periodoId = this.infoCopiado.periodo.Id;
    const colocacionId = colocacion._id;

    colocacion.verificandoConflictos = true;
    this.horarioMid
      .get(
        `colocacion-espacio-academico/grupo-estudio/sobreposicion?grupo-estudio-id=${grupoEstudioId}&periodo-id=${periodoId}&colocacion-id=${colocacionId}`
      )
      .subscribe((res: any) => {
        if (res.Success && res.Data.sobrepuesta) {
          colocacion.conConflicto = true;
          colocacion.conflictoGrupoEstudio = res.Data.colocacionConflicto;
        }
        colocacion.verificandoConflictos = false;
      });
  }

  verificarConflictosEspacioFisico(colocacion: any) {
    const periodoId = this.infoCopiado.periodo.Id;
    const colocacionId = colocacion._id;

    colocacion.verificandoConflictos = true;
    this.horarioMid
      .get(
        `colocacion-espacio-academico/espacio-fisico/sobreposicion?periodo-id=${periodoId}&colocacion-id=${colocacionId}`
      )
      .subscribe((res: any) => {
        if (res.Success && res.Data.sobrepuesta) {
          colocacion.conConflicto = true;
          colocacion.conflictoEspacioFisico = res.Data.colocacionConflicto;
        }
        colocacion.verificandoConflictos = false;
      });
  }

  verificarEspacioAcademicoExistente(colocacion: any) {
    const espacioAcademico = colocacion.espacioAcademico.nombre;
    const periodoId = this.infoCopiado.periodo.Id;
    const grupo = colocacion.grupo;
    colocacion.verificandoConflictos = true;
    this.espacioAcademicoService
      .get(
        `espacio-academico?query=nombre:${espacioAcademico},periodo_id:${periodoId},grupo:${grupo},activo:true`
      )
      .subscribe((res: any) => {
        if (res.Data && !(res.Data.length > 0)) {
          colocacion.conConflicto = true;
          colocacion.conflictoEspacioAcademico = {
            noExisteEspacio: true,
          };
          colocacion.verificandoConflictos = false;
          return;
        }
        //si el espacio existe, verificamos si es del grupo de estudio o esta en otro grupo
        this.verificarEspacioEnGrupoEstudio(colocacion);
      });
  }

  verificarEspacioEnGrupoEstudio(colocacion: any) {
    const espacioAcademico = colocacion.espacioAcademico.nombre;
    const grupo = colocacion.grupo;
    const grupoEstudioId = this.infoCopiado.grupoEstudio._id;
    this.espacioAcademicoService
      .get(
        `espacio-academico?query=nombre:${espacioAcademico},grupo_estudio_id:${grupoEstudioId},grupo:${grupo},activo:true`
      )
      .subscribe((res: any) => {
        if (res.Data && !(res.Data.length > 0)) {
          colocacion.conConflicto = true;
          colocacion.conflictoEspacioAcademico = {
            noPerteneceGrupoEstudio: true,
          };
        }
        colocacion.verificandoConflictos = false;
      });
  }

  abrirDialogoVerConflictos(colocacion: any) {
    colocacion.periodo = this.infoCopiado.periodo;
    colocacion.grupoEstudio = this.infoCopiado.grupoEstudio;
    const dialogRef = this.dialog.open(
      DialogoVerConflictosColocacionComponent,
      {
        width: '60%',
        height: 'auto',
        maxHeight: '75vh',
        data: colocacion,
      }
    );

    dialogRef.afterClosed().subscribe((res) => {
      if (res?.grupoCreado) {
        this.colocaciones.forEach((colocacion: any) => {
          this.quitarConflictosColocacion(colocacion);
        });
        this.verificarConflictosHorario();
      }
    });
  }

  construirTabla() {
    this.colocacionesContructorTabla = espaciosAcademicosContructorTabla;
    this.tablaColumnas = this.colocacionesContructorTabla.map(
      (column: any) => column.columnDef
    );
    //Asigna la info a la tabla
    this.colocaciones = ordenarPorPropiedad(
      this.infoCopiado.colocaciones,
      'grupo',
      1
    );
  }

  quitarConflictosColocacion(colocacion: any) {
    delete colocacion.conflictoGrupoEstudio;
    delete colocacion.conflictoEspacioFisico;
    delete colocacion.conflictoEspacioAcademico;
    delete colocacion.conConflicto;
    delete colocacion.verificandoConflictos;
  }
}
export function datosPrueba() {
  return {
    colocaciones: [
      {
        edificio: 'POR ASIGNAR',
        espacioAcademico: {
          activo: true,
          espacio_academico_padre: '64935cac85308dfabd19a938',
          grupo: '81',
          nombre: 'Seminario de Investigación e Innovación I',
          _id: '66db61076e6686ea0f771ede',
        },
        grupo: '81',
        horario: 'Jueves 08:00 - 10:00',
        isSelected: true,
        salon: 'POR ASIGNAR',
        sede: 'POR ASIGNAR',
        _id: '66fabea6e47d7e1dd8dd1452',
      },
      {
        edificio: 'PALACIO LA MERCED',
        espacioAcademico: {
          activo: true,
          espacio_academico_padre: '64935cac85308dfabd19a938',
          grupo: '81',
          nombre: 'Seminario de Investigación e Innovación I',
          _id: '66db61076e6686ea0f771ede',
        },
        grupo: '81',
        horario: 'Miércoles 06:00 - 08:00',
        isSelected: true,
        salon: 'AULA 202',
        sede: 'ACADEMICA LUIS A. CALVO',
        _id: '66fc4eb7e47d7e1dd8dd191c',
      },
      {
        edificio: 'PALACIO LA MERCED',
        espacioAcademico: {
          activo: true,
          espacio_academico_padre: '64935cac85308dfabd19a938',
          grupo: '81',
          nombre: 'Seminario de Investigación e Innovación I',
          _id: '66db61076e6686ea0f771ede',
        },
        grupo: '81',
        horario: 'Lunes 06:00 - 08:00',
        isSelected: true,
        salon: 'AULA 202',
        sede: 'ACADEMICA LUIS A. CALVO',
        _id: '66fe9fa7e47d7e1dd8dd1b3f',
      },
      {
        edificio: 'PALACIO LA MERCED',
        espacioAcademico: {
          activo: true,
          espacio_academico_padre: '64935cac85308dfabd19a938',
          grupo: '82',
          nombre: 'Seminario de Investigación e Innovación I',
          _id: '66d135076e6686bada771528',
        },
        grupo: '82',
        horario: 'Lunes 08:00 - 10:00',
        isSelected: true,
        salon: 'AULA 202',
        sede: 'ACADEMICA LUIS A. CALVO',
        _id: '66fdc550e47d7e1dd8dd1a2e',
      },
    ],
    grupoEstudio: {
      Activo: true,
      CodigoProyecto: 'Grupo',
      CuposGrupos: 30,
      EspaciosAcademicos: {
        activos: [
          // Espacios académicos activos
        ],
        desactivos: [
          // Espacios académicos desactivos
        ],
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
    periodo: {
      Activo: true,
      AplicacionId: 41,
      Ciclo: '3',
      CodigoAbreviacion: 'PA',
      Descripcion: 'Periodo académico 2025-3',
      FechaCreacion: '2024-09-18T20:37:22.92499Z',
      FechaModificacion: '2024-09-28T16:21:45.200684Z',
      FinVigencia: '2024-12-31T10:00:00Z',
      Id: 61,
      InicioVigencia: '2024-09-01T10:00:00Z',
      Nombre: '2025-3',
      Year: 2025,
    },
  };
}
