import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CrearGrupoDialogComponent } from './components/crear-grupo-dialog/crear-grupo-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { gruposEstudioContructorTabla } from './utilidades';
import { EditarGrupoDialogComponent } from './components/editar-grupo-dialog/editar-grupo-dialog.component';

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

  espaciosAcademicosDelSemestre: any;
  gruposEstudios:any
  tablaColumnas:any

  formStep1!: FormGroup;

  constructor(
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.dataParametrica = datosPrueba()
    this.gruposEstudios = datosPruebaTabla()
    this.construirTabla()
  }

  abrirDialogoCrearGrupo() {

    this.dialog.open(CrearGrupoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data: this.dataParametrica
    });
  }

  abrirDialogoEditarGrupo() {

    this.dialog.open(EditarGrupoDialogComponent, {
      width: '70%',
      height: 'auto',
      maxHeight: '65vh',
      data: this.dataParametrica
    });
  }

  construirTabla() {
    this.gruposEstudioContructorTabla = gruposEstudioContructorTabla    
    this.tablaColumnas = this.gruposEstudioContructorTabla.map((column:any) => column.columnDef);
    //Asigna la info a la tabla
    this.gruposEstudios = new MatTableDataSource(this.gruposEstudios);
    //Asigna el paginador
    setTimeout(()=>{this.gruposEstudios.paginator = this.paginator; }, 1000)
  }

  buscarGrupoEstudio(event: Event) {
    const valorFiltro = (event.target as HTMLInputElement).value;
    this.gruposEstudios.filter = valorFiltro.trim().toLowerCase();
  }

  volverASelectsParametrizables(){
    this.volverASelects.emit(true)
  }
}


export function datosPruebaTabla() {
  return [
    {
      "Codigo": "P001",
      "Capacidad": 30,
      "EspacioAcademico": [
        { "Nombre": "Álgebra", "Profesor": "Prof. A" },
        { "Nombre": "Cálculo", "Profesor": "Prof. B" },
        { "Nombre": "Geometría", "Profesor": "Prof. C" }
      ]
    },
    {
      "Codigo": "P002",
      "Capacidad": 25,
      "EspacioAcademico": [
        { "Nombre": "Mecánica", "Profesor": "Prof. D" },
        { "Nombre": "Electromagnetismo", "Profesor": "Prof. E" },
        { "Nombre": "Termodinámica", "Profesor": "Prof. F" }
      ]
    },
    {
      "Codigo": "P003",
      "Capacidad": 20,
      "EspacioAcademico": [
        { "Nombre": "Química Orgánica", "Profesor": "Prof. G" },
        { "Nombre": "Química Inorgánica", "Profesor": "Prof. H" },
        { "Nombre": "Bioquímica", "Profesor": "Prof. I" }
      ]
    },
    {
      "Codigo": "P004",
      "Capacidad": 35,
      "EspacioAcademico": [
        { "Nombre": "Botánica", "Profesor": "Prof. J" },
        { "Nombre": "Zoología", "Profesor": "Prof. K" },
        { "Nombre": "Microbiología", "Profesor": "Prof. L" }
      ]
    },
    {
      "Codigo": "P004",
      "Capacidad": 35,
      "EspacioAcademico": [
        { "Nombre": "Botánica", "Profesor": "Prof. J" },
        { "Nombre": "Zoología", "Profesor": "Prof. K" },
        { "Nombre": "Microbiología", "Profesor": "Prof. L" }
      ]
    }
  ];
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
      "Activo": false,
      "AplicacionId": 41,
      "Ciclo": "2",
      "CodigoAbreviacion": "PA",
      "Descripcion": "Periodo académico 2024-2",
      "FechaCreacion": "2024-05-17 12:34:48.502181 +0000 +0000",
      "FechaModificacion": "2024-06-10 20:49:05.879567 +0000 +0000",
      "FinVigencia": "2024-05-24T00:00:00Z",
      "Id": 56,
      "InicioVigencia": "2024-05-15T00:00:00Z",
      "Nombre": "2024-2",
      "Year": 2024
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
    "semestre": {
      "Activo": true,
      "CodigoAbreviacion": "2DOS",
      "Descripcion": "Segundo semestre",
      "FechaCreacion": "2024-06-18 14:50:35.600869 +0000 +0000",
      "FechaModificacion": "2024-06-18 14:54:57.900294 +0000 +0000",
      "Id": 6508,
      "Nombre": "Segundo semestre",
      "NumeroOrden": 2,
      "ParametroPadreId": null,
      "TipoParametroId": {
        "Id": 107,
        "Nombre": "Semestre académico",
        "Descripcion": "Semestre académico",
        "CodigoAbreviacion": "SA",
        "Activo": true
      }
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

const ELEMENT_DATA: any[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];
