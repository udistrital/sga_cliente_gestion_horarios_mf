import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProyectoAcademicoService } from '../../../../services/proyecto_academico.service';
import { selectsPasoDos, selectsPasoUno } from './utilidades';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametros } from '../../../../../utils/Parametros';
import { PopUpManager } from '../../../../managers/popUpManager';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { ordenarPorPropiedad } from '../../../../../utils/listas';
import { OikosService } from '../../../../services/oikos.service';
import { PlanTrabajoDocenteMidService } from '../../../../services/plan-trabajo-docente-mid.service';

@Component({
  selector: 'udistrital-registro-horarios',
  templateUrl: './registro-horarios.component.html',
  styleUrl: './registro-horarios.component.scss'
})
export class RegistroHorariosComponent implements OnInit {

  [key: string]: any; // Permitir el acceso dinámico con string keys

  @Input() dataParametrica: any;
  @Output() volverASelects = new EventEmitter<boolean>();

  selectsPasoUno: any
  selectsPasoDos: any

  formPaso1!: FormGroup;
  formPaso2!: FormGroup;

  bloques:any
  espaciosAcademicos: any
  infoEspacio = {}
  informacionParaPasoDos: any
  gruposEstudio: any
  facultades: any
  periodos: any
  salones: any

  banderaHorario = false

  constructor(
    private _formBuilder: FormBuilder,
    private horarioMid: HorarioMidService,
    private translate: TranslateService,
    private planTrabajoDocenteMid: PlanTrabajoDocenteMidService,
    private projectService: ProyectoAcademicoService,
    private parametros: Parametros,
    private popUpManager: PopUpManager,
    private oikosService: OikosService,
  ) {
  }

  ngOnInit() {
    this.dataParametrica = datosPrueba()
    this.cargarPeriodos()
    this.listarGruposEstudioSegunParametros()
    this.iniciarFormularios()
    this.cargarInformacionParaPasoDos()
  }

  volverASelectsParametrizables() {
    this.volverASelects.emit(true)
  }

  iniciarFormularios() {
    this.iniciarFormPaso1()
    this.iniciarFormPaso2()
  }

  iniciarFormPaso1() {
    this.formPaso1 = this._formBuilder.group({
      periodo: ['', Validators.required],
      grupoEstudio: ['', Validators.required],
      grupoEspacio: ['', Validators.required],
    });
    this.selectsPasoUno = selectsPasoUno
  }

  iniciarFormPaso2() {
    this.formPaso2 = this._formBuilder.group({
      facultad: ['', Validators.required],
      bloque: ['', Validators.required],
      salon: ['', Validators.required],
      horas: ['', [Validators.required, Validators.min(0.5), Validators.max(8)]]
    });
    this.selectsPasoDos = selectsPasoDos
  }

  listarGruposEstudioSegunParametros() {
    const { proyecto, planEstudio, semestre } = this.dataParametrica;
    const query = `proyecto-academico=${proyecto.Id}&plan-estudios=${planEstudio.Id}&semestre=${semestre.Id}&limit=0`;

    this.horarioMid.get(`grupo-estudio?${query}`).subscribe((res: any) => {
      if (res.Success) {
        if (res.Data.length > 0) {
          this.gruposEstudio = ordenarPorPropiedad(res.Data, "Nombre", 1)
        } else {
          this.popUpManager.showAlert("", this.translate.instant("GLOBAL.no_informacion_registrada"))
        }
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant("GLOBAL.error"))
      }
    })
  }

  listarEspaciosDeGrupo(grupo: any) {
    this.espaciosAcademicos = grupo.EspaciosAcademicos.map((espacio: any) => {
      espacio.Nombre = espacio.nombre + " (" + espacio.grupo + ")";
      return espacio;
    });
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res
    })
  }
  
  cargarInformacionParaPasoDos() {
    const dependenciaId = this.dataParametrica.proyecto.Id
    this.planTrabajoDocenteMid.get('espacio-fisico/dependencia?dependencia=' + dependenciaId).subscribe((res:any)=>{
      this.informacionParaPasoDos = res.Data
      this.facultades = res.Data.Sedes
      this.limpiarSelectoresDependientes('facultad');
    })
  }
  
  cargarBloquesSegunFacultad(sede: any) {
    const facultadId = sede.Id
    this.bloques = this.informacionParaPasoDos.Edificios[facultadId];
    this.limpiarSelectoresDependientes('bloque');
  }
  
  cargarSalonesSegunBloque(edificio: any) {
    const edificioId = edificio.Id
    this.salones = this.informacionParaPasoDos.Salones[edificioId];
  }
  
  limpiarSelectoresDependientes(selector: string) {
    //este metodo borra los valores seleccionados, si se cambia el select anterior
    const index = selectsPasoDos.findIndex(s => s.name === selector);
    for (let i = index + 1; i < selectsPasoDos.length; i++) {
      this[selectsPasoDos[i].options] = [];
    }
  }

  enviarInfoParaHorario(){
    this.infoEspacio = {
      ...this.formPaso1.value,
      ...this.formPaso2.value
    };
    this.banderaHorario = true
  }
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
