import { CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CardDetalleCarga, CoordXY } from '../../../../../../models/diccionario/card-detalle-carga';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { MODALS } from '../../../../../../models/diccionario/diccionario';
import { OikosService } from '../../../../../../services/oikos.service';
import { PlanTrabajoDocenteService } from '../../../../../../services/plan-trabajo-docente.service';
import { PlanTrabajoDocenteMidService } from '../../../../../../services/plan-trabajo-docente-mid.service';
import { MatDialog } from '@angular/material/dialog';
import { DetalleEspacioDialogComponent } from './components/detalle-espacio-dialog/detalle-espacio-dialog.component';
import { EditarEspacioDialogComponent } from './components/editar-espacio-dialog/editar-espacio-dialog.component';
import { HorarioService } from '../../../../../../services/horario.service';

@Component({
  selector: 'udistrital-horario',
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.scss']
})
export class HorarioComponent implements OnInit {

  @ViewChild('contenedorCargaLectiva', { static: false }) contenedorCargaLectiva!: ElementRef;
  @Input() Data: any;
  @Input() infoEspacio: any;
  @Input() horarioSemestreId: any;
  @Output() banderaNuevoEspacio = new EventEmitter<boolean>();
  @Output() DataChanged: EventEmitter<any> = new EventEmitter();

  identificador: number = 0;
  seleccion: number = 0;
  listaCargaLectiva: any[] = [];
  listaOcupacion: any[] = [];
  ocupados: any[] = [];

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
    private horarioService: HorarioService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.cargarColocaciones()
  }

  cargarColocaciones() {
    this.horarioService.get("colocacion-espacio-academico?query=HorarioSemestreId:" + this.horarioSemestreId + ",Activo:true&limit=0").subscribe((res: any) => {
      if (res.Success && res.Data.length > 0) {
        for (var colocacion of res.Data) {
          let colocacionEspacio = JSON.parse(colocacion.ResumenColocacionEspacioFisico)
          colocacionEspacio.idColocacion = colocacion._id
          this.listaCargaLectiva.push(colocacionEspacio)
        }
      }
    })
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
          if (elementClicked.idColocacion) {
            this.horarioService.delete('colocacion-espacio-academico', elementClicked.idColocacion).subscribe(
              (response: any) => {
              });
          }
          const c: Element = this.contenedorCargaLectiva.nativeElement;
          if (htmlElement.parentElement.parentElement) {
            c.removeChild(htmlElement.parentElement.parentElement);
          }
        }
      });
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
    // this.sgaPlanTrabajoDocenteMidService.get(`espacio-fisico/disponibilidad?salon=${elementMoved.salon.Id}&vigencia=${this.Data.vigencia}&plan=${this.Data.plan_docente[this.seleccion]}`).subscribe((res: any) => {
    //   this.ocupados = res.Response.Body ? res.Response.Body : [];
    //   this.ocupados.forEach(newElement => {
    //     const newElementFormat: CardDetalleCarga = {
    //       id: null,
    //       nombre: this.translate.instant('ptd.espacio_ocupado'),
    //       idCarga: newElement.id,
    //       idEspacioAcademico: null,
    //       idActividad: null,
    //       horas: newElement.horas,
    //       horaFormato: null,
    //       tipo: null,
    //       sede: null,
    //       edificio: null,
    //       proyecto: null,
    //       salon: null,
    //       estado: null,
    //       bloqueado: true,
    //       dragPosition: newElement.finalPosition,
    //       prevPosition: newElement.finalPosition,
    //       finalPosition: newElement.finalPosition
    //     };
    //     this.listaOcupacion.push(newElementFormat);
    //     const coord = this.getPositionforMatrix(newElement);
    //     this.changeStateRegion(coord.x, coord.y, newElement.horas, true);
    //   });
    // });
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
          elementMoved.dia = this.calcularDia(elementMoved)
          if (this.isInsideGrid(elementMoved)) {
            const coord = this.getPositionforMatrix(elementMoved);
            this.changeStateRegion(coord.x, coord.y, elementMoved.horas, true);
          }
          this.crearModificarColocacion(elementMoved)
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
          event.source.getRootElement().scrollIntoView({ block: "center", behavior: "smooth" }); JSON.stringify
        }
      }
    );

  }

  crearModificarColocacion(espacio: CardDetalleCarga) {
    const colocacionEspacio = this.construirObjetoColocacionEspacio(espacio)

    if (espacio.idColocacion == null) {
      this.horarioService.post("colocacion-espacio-academico", colocacionEspacio).subscribe((res: any) => {
        espacio.idColocacion = res.Data._id
      })
    } else {
      this.horarioService.put("colocacion-espacio-academico/" + espacio.idColocacion, colocacionEspacio).subscribe((res: any) => {
      })
    }
  }

  construirObjetoColocacionEspacio(espacio: any) {
    const colocacionEspacioAcademico = JSON.stringify({
      horas: espacio.horas,
      horaFormato: espacio.horaFormato,
      tipo: espacio.tipo,
      estado: espacio.estado,
      dragPosition: espacio.dragPosition,
      prevPosition: espacio.prevPosition,
      finalPosition: espacio.finalPosition
    });
  
    const resumenColocacionEspacioFisico = JSON.stringify({
      colocacion: JSON.parse(colocacionEspacioAcademico),
      espacio_fisico: {
        edificio_id: espacio.edificio.Id,
        salon_id: espacio.salon.Id,
        sede_id: espacio.sede.Id
      }
    });
  
    const colocacioEspacio = {
      EspacioAcademicoId: espacio.idEspacioAcademico,
      EspacioFisicoId: espacio.salon.Id,
      ColocacionEspacioAcademico: colocacionEspacioAcademico,
      ResumenColocacionEspacioFisico: resumenColocacionEspacioFisico,
      HorarioSemestreId: this.horarioSemestreId,
      Activo: true
    };

    return colocacioEspacio
  }

  calcularDia(elementMoved: CardDetalleCarga) {
    const diasDeLaSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const dia = Math.floor(elementMoved.dragPosition.x / this.snapGridSize.x);
    const nombreDia = diasDeLaSemana[dia];
    return nombreDia
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
    const salon = this.infoEspacio.salon
    const x = this.snapGridSize.x * -2.25;
    const y = 0;
    this.identificador++;
    const newElement: CardDetalleCarga = {
      id: this.identificador,
      nombre: this.infoEspacio.grupoEspacio.Nombre,
      idColocacion: null,
      // idEspacioAcademico: this.asignaturaSelected.id,
      idEspacioAcademico: this.infoEspacio.grupoEspacio._id,
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
    console.log(this.listaCargaLectiva)
  }

  abrirDialogoDetalleEspacio(infoEspacio: any) {
    this.dialog.open(DetalleEspacioDialogComponent, {
      data: infoEspacio,
      width: "50%",
      height: "auto"
    });
  }

  abrirDialogoEditarEspacio(infoEspacio: any) {
    const dialogRef = this.dialog.open(EditarEspacioDialogComponent, {
      data: infoEspacio,
      width: "60%",
      height: "auto"
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res && res.id) {
        const espacio = this.listaCargaLectiva.find((esp: any) => esp.id === res.id);
        if (espacio) {
          Object.assign(espacio, {
            sede: res.facultad,
            edificio: res.bloque,
            salon: res.salon,
            horas: res.horas,
            horaFormato: this.calculateTimeSpan(espacio.dragPosition, res.horas)
          });
        }
        this.crearModificarColocacion(espacio)
      }
    });
  }

  nuevoEspacio() {
    this.banderaNuevoEspacio.emit(true);
  }
}