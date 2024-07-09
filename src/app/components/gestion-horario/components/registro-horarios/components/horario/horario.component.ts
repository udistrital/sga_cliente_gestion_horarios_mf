import { CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CardDetalleCarga, CoordXY } from '../../../../../../models/diccionario/card-detalle-carga';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { MODALS } from '../../../../../../models/diccionario/diccionario';
import { OikosService } from '../../../../../../services/oikos.service';
import { PlanTrabajoDocenteService } from '../../../../../../services/plan-trabajo-docente.service';
import { PlanTrabajoDocenteMidService } from '../../../../../../services/plan-trabajo-docente-mid.service';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DetalleEspacioDialogComponent } from './components/detalle-espacio-dialog/detalle-espacio-dialog.component';
import { EditarEspacioDialogComponent } from './components/editar-espacio-dialog/editar-espacio-dialog.component';

@Component({
  selector: 'udistrital-horario',
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.scss']
})
export class HorarioComponent implements OnInit{

  @ViewChild('contenedorCargaLectiva', { static: false }) contenedorCargaLectiva!: ElementRef;
  listaCargaLectiva: any[] = [];
  listaOcupacion: any[] = [];
  /*************************** */

  /** Entradas y Salidas */

  @Input() Data: any;
  @Input() infoEspacio: any;
  @Output() infoDeHorario = new EventEmitter<{ comando: string, espacioAcademico: any }>();
  @Output() DataChanged: EventEmitter<any> = new EventEmitter();

  edit: boolean = false;
  isDocente: boolean = false;
  isCoordinador: boolean = false;
  vinculaciones: any[] = [];
  asignaturas: any[] = [];
  actividades: any[] = [];
  vinculacionSelected: any = undefined;
  asignaturaSelected: any = undefined;
  actividadSelected: any = undefined;
  seleccion: number = 0;
  identificador: number = 0;
  observacion: string = '';
  searchTerm$ = new Subject<any>();
  opcionesEdificios: any[] = [];
  opcionesSedes: any[] = [];
  opcionesSalones: any[] = [];
  opcionesSalonesFiltrados: any[] = [];
  opcionesUsos: any[] = [];
  sede: any;
  edificio: any;
  salon: any;
  grupo: any;
  ubicacionForm!: FormGroup;
  ubicacionActive: boolean = false;
  editandoAsignacion!: CardDetalleCarga;
  ocupados: any[] = [];
  aprobacion: any = undefined;
  EspaciosProyecto: any = undefined;
  manageByTime: boolean = false;

  readonly horarioSize = { days: 7, hourIni: 6, hourEnd: 23, difHoras: 23 - 6, stepHour: 0.25 };
  readonly containerGridLengths = {
    x: this.horarioSize.days,
    y: (this.horarioSize.hourEnd - this.horarioSize.hourIni),
  };
  readonly snapGridSize = { x: 110, y: 75, ymin: 75 * 0.25 }; //px no olvide editarlas en scss si las cambia
  readonly containerGridsize = {
    x: this.containerGridLengths.x * this.snapGridSize.x,
    y: this.containerGridLengths.y * this.snapGridSize.y
  };
  readonly tipo = { carga_lectiva: 1, actividades: 2 };
  readonly estado = { flotando: 1, ubicado: 2, ocupado: 3 }

  matrixBusy = Array(this.containerGridLengths.x)
    .fill(0).map(() => Array(this.containerGridLengths.y / this.horarioSize.stepHour)
      .fill(0).map(() => false)
    )

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaPlanTrabajoDocenteMidService: PlanTrabajoDocenteMidService,
    private planTrabajoDocenteService: PlanTrabajoDocenteService,
    private builder: FormBuilder,
    private oikosService: OikosService,
    private readonly elementRef: ElementRef,
    public dialog: MatDialog
  ) { 
    
  }

  ngOnInit() {
  }

  getDragPosition(eventDrag: CdkDragMove) {
    const contenedor: DOMRect = this.contenedorCargaLectiva.nativeElement.getBoundingClientRect();
    let posicionRelativa = {
      x: Math.floor(eventDrag.pointerPosition.x - contenedor.left - (this.snapGridSize.x / 2)),
      y: Math.floor(eventDrag.pointerPosition.y - contenedor.top - (this.snapGridSize.ymin))
    };
    posicionRelativa.x = posicionRelativa.x <= 0 ? 0 : posicionRelativa.x;
    posicionRelativa.y = posicionRelativa.y <= 0 ? 0 : posicionRelativa.y;
    posicionRelativa.x = Math.round(posicionRelativa.x / this.snapGridSize.x) * this.snapGridSize.x;
    posicionRelativa.y = Math.round(posicionRelativa.y / this.snapGridSize.ymin) * this.snapGridSize.ymin;
    return posicionRelativa;
  }

  chechkUsedRegion(x: number, y: number, h: number) {
    const ymax = y + h / this.horarioSize.stepHour;
    let busy = false;
    for (let index = y; index < ymax; index++) {
      if (this.matrixBusy[x][index]) {
        busy = true;
        break;
      }
    }
    return busy;
  }

  changeStateRegion(x: number, y: number, h: number, state: boolean) {
    const ymax = y + h / this.horarioSize.stepHour;
    for (let index = y; index < ymax; index++) {
      this.matrixBusy[x][index] = state;
    }
  }

  isInsideGrid(element: CardDetalleCarga) {
    const left = (0 <= element.finalPosition.x);
    const right = (element.finalPosition.x < this.containerGridsize.x);
    const top = (0 <= element.finalPosition.y);
    const bottom = (element.finalPosition.y < this.containerGridsize.y);
    return left && right && top && bottom;
  }

  getPositionforMatrix(element: CardDetalleCarga) {
    const x = Math.floor(element.finalPosition.x / this.snapGridSize.x);
    const y = Math.floor(element.finalPosition.y / this.snapGridSize.ymin);
    return { x, y };
  }

  genHoursforTable() {
    return Array(this.horarioSize.hourEnd - this.horarioSize.hourIni).fill(0).map((_, index) => index + this.horarioSize.hourIni);
  }

  deleteElement(htmlElement: any, elementClicked: CardDetalleCarga) { // as HTMLElement
    if (elementClicked.bloqueado) {
      return;
    }
    this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.borrar'), this.translate.instant('ptd.ask_borrar'), MODALS.QUESTION, true).then(
      action => {
        if (action.value) {
          if (this.isInsideGrid(elementClicked)) {
            const coord = this.getPositionforMatrix(elementClicked);
            this.changeStateRegion(coord.x, coord.y, elementClicked.horas, false);
          }
          const idx = this.listaCargaLectiva.findIndex(element => element.id == elementClicked.id);
          this.listaCargaLectiva.splice(idx, 1);
          if (elementClicked.idCarga) {
            this.planTrabajoDocenteService.delete('carga_plan', { Id: elementClicked.idCarga }).subscribe(
              (response: any) => {
                this.DataChanged.emit(this.listaCargaLectiva);
              });
          }
          const c: Element = this.contenedorCargaLectiva.nativeElement;
          if (htmlElement.parentElement && htmlElement.parentElement.parentElement) {
            c.removeChild(htmlElement.parentElement.parentElement);
          }
        }
      });
  }

  cambioSede() {
    this.opcionesEdificios = [];
    this.opcionesSalones = [];
    this.opcionesSalonesFiltrados = [];
    this.ubicacionForm.get('edificio')?.disable();
    this.ubicacionForm.get('salon')?.disable();
    this.ubicacionForm.get('edificio')?.setValue(undefined);
    this.ubicacionForm.get('salon')?.setValue(undefined);
    return new Promise((resolve, reject) => {
      if (this.asignaturaSelected) {
        this.opcionesEdificios = this.EspaciosProyecto.Edificios[this.ubicacionForm.get("sede")?.value.Id];
        this.opcionesEdificios.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        this.ubicacionForm.get('edificio')?.enable();
        resolve(this.opcionesEdificios)
      } else {
        this.oikosService.get(`espacio_fisico_padre?query=PadreId.Id:${this.ubicacionForm.get("sede")?.value.Id}&fields=HijoId&limit=0`).subscribe((res:any) => {
          res.forEach((element: any) => {
            this.opcionesEdificios.push(element.HijoId);
            this.ubicacionForm.get('edificio')?.enable();
          });
          this.opcionesEdificios.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
          resolve(res);
        });
      }
    });
  }

  cambioEdificio() {
    this.opcionesSalones = [];
    this.opcionesSalonesFiltrados = [];
    this.ubicacionForm.get('salon')?.disable();
    this.ubicacionForm.get('salon')?.setValue(undefined);
    if (this.asignaturaSelected) {
      this.opcionesSalones = this.EspaciosProyecto.Salones[this.ubicacionForm.get("edificio")?.value.Id];
      this.opcionesSalones.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      this.opcionesSalonesFiltrados = this.opcionesSalones;
      this.ubicacionForm.get('salon')?.enable();
    } else {
      this.oikosService.get(`espacio_fisico_padre?query=PadreId.Id:${this.ubicacionForm.get("edificio")?.value.Id}&fields=HijoId&limit=0`).subscribe((res:any) => {
        res.forEach((element: any) => {
          this.opcionesSalones.push(element.HijoId);
          this.ubicacionForm.get('salon')?.enable();
        });
        this.opcionesSalones.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        this.opcionesSalonesFiltrados = this.opcionesSalones;
      });
    }
  }

  cambioSalon(element: any) {
    this.salon = element.option.value;
    this.ubicacionForm.get('salon')?.setValue(this.salon.Nombre);
  }

  onDragMoved(event: CdkDragMove, elementMoved: CardDetalleCarga) {
    if (this.isInsideGrid(elementMoved)) {
      const coord = this.getPositionforMatrix(elementMoved);
      this.changeStateRegion(coord.x, coord.y, elementMoved.horas, false);
    }
    const posicionRelativa = this.getDragPosition(event);
    const x = posicionRelativa.x / this.snapGridSize.x;
    const y = posicionRelativa.y / this.snapGridSize.ymin;
    const ocupado = this.chechkUsedRegion(x, y, elementMoved.horas);
    if (ocupado) {
      elementMoved.dragPosition = elementMoved.prevPosition;
      event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
      event.source._dragRef.disabled = true;
      elementMoved.estado = this.estado.ocupado;
    } else {
      elementMoved.dragPosition = posicionRelativa;
      elementMoved.estado = this.estado.ubicado;
    }
    if ((posicionRelativa.x != elementMoved.prevPosition.x) || (posicionRelativa.y != elementMoved.prevPosition.y)) {
      elementMoved.prevPosition = elementMoved.dragPosition;
      elementMoved.horaFormato = this.calculateTimeSpan(elementMoved.dragPosition, elementMoved.horas);
    }
  }

  onDragStarted(elementMoved: CardDetalleCarga) {
    this.limpiarOcupado();
    if (this.isCoordinador) {
      this.sgaPlanTrabajoDocenteMidService.get(`espacio-fisico/disponibilidad?salon=${elementMoved.salon.Id}&vigencia=${this.Data.vigencia}&plan=${this.Data.plan_docente[this.seleccion]}`).subscribe((res:any) => {
        this.ocupados = res.Response.Body ? res.Response.Body : [];
        this.ocupados.forEach(newElement => {
          const newElementFormat: CardDetalleCarga = {
            id: null,
            nombre: this.translate.instant('ptd.espacio_ocupado'),
            idCarga: newElement.id,
            idEspacioAcademico: null,
            idActividad: null,
            horas: newElement.horas,
            horaFormato: null,
            tipo: null,
            sede: null,
            edificio: null,
            proyecto: null,
            salon: null,
            estado: null,
            bloqueado: true,
            dragPosition: newElement.finalPosition,
            prevPosition: newElement.finalPosition,
            finalPosition: newElement.finalPosition
          };
          this.listaOcupacion.push(newElementFormat);
          const coord = this.getPositionforMatrix(newElement);
          this.changeStateRegion(coord.x, coord.y, newElement.horas, true);
        });
      });
    }
  }
  calculateTimeSpan(dragPosition: CoordXY, h: number): string {
    const iniTimeRaw = dragPosition.y / this.snapGridSize.y + this.horarioSize.hourIni;
    const finTimeRaw = iniTimeRaw + h;
    const horaI = Math.floor(iniTimeRaw);
    const minI = (iniTimeRaw - horaI) * 60;
    const horaF = Math.floor(finTimeRaw);
    const minF = (finTimeRaw - horaF) * 60;
    return String(horaI).padStart(2, '0') + ':' + String(minI).padEnd(2, '0') + ' - ' + String(horaF).padStart(2, '0') + ':' + String(minF).padEnd(2, '0');
  }

  onDragReleased(event: CdkDragRelease, elementMoved: CardDetalleCarga) {
    this.limpiarOcupado();
    this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.asignar'), this.translate.instant('ptd.ask_mover') + "<br>" + elementMoved.horaFormato + "?", MODALS.QUESTION, true).then(
      (action) => {
        if (action.value) {
          elementMoved.estado = this.estado.ubicado;
          elementMoved.finalPosition = elementMoved.dragPosition;
          if (this.isInsideGrid(elementMoved)) {
            const coord = this.getPositionforMatrix(elementMoved);
            this.changeStateRegion(coord.x, coord.y, elementMoved.horas, true);
          }
        } else {
          if (this.isInsideGrid(elementMoved)) {
            const coord = this.getPositionforMatrix(elementMoved);
            this.changeStateRegion(coord.x, coord.y, elementMoved.horas, false);
          }
          elementMoved.dragPosition = { x: this.snapGridSize.x * -2.25, y: 0 };
          elementMoved.prevPosition = elementMoved.dragPosition;
          elementMoved.finalPosition = elementMoved.dragPosition;
          event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
          event.source._dragRef.disabled = true;
          elementMoved.estado = this.estado.flotando;
          event.source.getRootElement().scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    );
  }

  limpiarOcupado() {
    if (this.listaOcupacion.length > 0) {
      this.listaOcupacion.forEach(ocupado => {
        const coord = this.getPositionforMatrix(ocupado);
        this.changeStateRegion(coord.x, coord.y, ocupado.horas, false);
      });
      this.listaOcupacion = [];
    }
  }

  addCarga() {
    const h = this.infoEspacio.horas
    const salon = this.infoEspacio.salon
    const x = this.snapGridSize.x * -2.25;
    const y = 0;
    if (true) {
      this.identificador++;
      const newElement: CardDetalleCarga = {
        id: this.identificador,
        nombre: this.infoEspacio.grupoEspacio.Nombre,
        idCarga: null,
        // idEspacioAcademico: this.asignaturaSelected.id,
        idEspacioAcademico: null,
        idActividad: null,
        sede: this.infoEspacio.facultad,
        edificio: this.infoEspacio.bloque,
        salon: salon || "-",
        horas: this.infoEspacio.horas,
        horaFormato: "",
        proyecto: this.infoEspacio.proyecto,
        tipo: this.tipo.carga_lectiva,
        estado: this.estado.flotando,
        bloqueado: false,
        dragPosition: { x: x, y: y },
        prevPosition: { x: x, y: y },
        finalPosition: { x: x, y: y }
      };
      this.listaCargaLectiva.push(newElement);
    } else {
      if (this.isInsideGrid(this.editandoAsignacion)) {
        const coord = this.getPositionforMatrix(this.editandoAsignacion);
        this.changeStateRegion(coord.x, coord.y, this.editandoAsignacion.horas, false);
      }
      this.editandoAsignacion.horas = h;
      this.editandoAsignacion.sede = this.ubicacionForm.get('sede')?.value;
      this.editandoAsignacion.edificio = this.ubicacionForm.get('edificio')?.value ? this.ubicacionForm.get('edificio')?.value : "-";
      this.editandoAsignacion.salon = salon || "-";
      this.editandoAsignacion.dragPosition = { x: x, y: y };
      this.editandoAsignacion.prevPosition = this.editandoAsignacion.dragPosition;
      this.editandoAsignacion.finalPosition = this.editandoAsignacion.dragPosition;
      this.editandoAsignacion.estado = this.estado.flotando;
    }

    this.cancelarUbicacion();
  }
  

  cancelarUbicacion() {
    this.ubicacionActive = false;
    const x = this.snapGridSize.x * -2.25;
    const y = 0;
    this.editandoAsignacion = {
      id: null,
      nombre: '',
      idCarga: null,
      idEspacioAcademico: null,
      idActividad: null,
      horas: 0,
      horaFormato: null,
      tipo: null,
      sede: null,
      edificio: null,
      proyecto: null,
      salon: null,
      estado: null,
      bloqueado: true,
      dragPosition: {x, y},
      prevPosition: {x, y},
      finalPosition: {x, y}
    };
  }

  abrirDialogoDetalleEspacio(infoEspacio:any){
    const dialogRef = this.dialog.open(DetalleEspacioDialogComponent,{
      data: infoEspacio,
      width: "50%",
      height: "auto"
    });
  }

  abrirDialogoEditarEspacio(infoEspacio:any){
    const dialogRef = this.dialog.open(EditarEspacioDialogComponent,{
      data: infoEspacio,
      width: "60%",
      height: "auto"
    });
  }

  enviarInfoARegistroHorarios(comando: string, espacioAcademico:any) {
    if(comando == "nuevoEspacio"){
      this.infoDeHorario.emit({ comando, espacioAcademico });
    }else if(comando == "editarEspacio"){
      this.infoDeHorario.emit({ comando, espacioAcademico });
    }
    
  }

}

export function datosPrueba(){
  return {
    "bloque": {
      "CodigoAbreviacion": "FAAS01",
      "Descripcion": "geedificio_FAAS01",
      "Id": 43,
      "Nombre": "PALACIO LA MERCED"
    },
    "facultad": {
      "CodigoAbreviacion": "FALC",
      "Descripcion": "gesede_37",
      "Id": 10,
      "Nombre": "ACADEMICA LUIS A. CALVO"
    },
    "grupoEspacio": {
      "Nombre": "Asignatura x2 (Grupo1)",
      "espacio_academico_padre": "6532d6fe432effe177e28735",
      "grupo": "Grupo1",
      "nombre": "Asignatura x2",
      "_id": "6532d6fe432eff727ae28739"
    },
    "grupoEstudio": {
      "Activo": true,
      "CodigoProyecto": "Prueba",
      "CuposGrupos": 30,
      "EspaciosAcademicos": [
        {
          // Agregar detalles del primer espacio académico aquí
        },
        {
          // Agregar detalles del segundo espacio académico aquí
        }
      ],
      "FechaCreacion": "2024-06-27T16:45:20.443Z",
      "FechaModificacion": "2024-06-27T16:45:20.443Z",
      "IndicadorGrupo": "01",
      "Nombre": "Prueba01",
      "PlanEstudiosId": "14",
      "ProyectoAcademicoId": "30",
      "SemestreId": "6508",
      "__v": 0,
      "_id": "667d9720be067c5635857437"
    },
    "horas": 2,
    "periodo": {
      "Activo": false,
      "AplicacionId": 41,
      "Ciclo": "2",
      "CodigoAbreviacion": "PA",
      "Descripcion": "Periodo académico 2024-2",
      "FechaCreacion": "2024-05-17 12:34:48.502181 +0000 +0000",
      "FechaModificacion": "2024-07-02 17:40:19.544567 +0000 +0000",
      "FinVigencia": "2024-05-24T00:00:00Z",
      "Id": 56,
      "InicioVigencia": "2024-05-15T00:00:00Z",
      "Nombre": "2024-2",
      "Year": 2024
    },
    "salon": {
      "CodigoAbreviacion": "00CT0122",
      "Descripcion": "gesalones_00CT0122",
      "Id": 145,
      "Nombre": "AULA 202"
    }
  }
  
}