import { CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  CardDetalleCarga,
  CoordXY,
} from '../../../../../../models/diccionario/card-detalle-carga';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../../../managers/popUpManager';
import { MODALS } from '../../../../../../models/diccionario/diccionario';
import { MatDialog } from '@angular/material/dialog';
import { DetalleEspacioDialogComponent } from './components/detalle-espacio-dialog/detalle-espacio-dialog.component';
import { EditarEspacioDialogComponent } from './components/editar-espacio-dialog/editar-espacio-dialog.component';
import { HorarioService } from '../../../../../../services/horario.service';
import { HorarioMidService } from '../../../../../../services/horario-mid.service';
import { TrabajoDocenteService } from '../../../../../../services/trabajo-docente.service';
import { TrabajoDocenteMidService } from '../../../../../../services/trabajo-docente-mid.service';

@Component({
  selector: 'udistrital-horario',
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.scss'],
})
export class HorarioComponent implements OnInit {
  @ViewChild('contenedorCargaLectiva', { static: false })
  contenedorCargaLectiva!: ElementRef;
  @Input() infoEspacio: any;
  @Input() infoAdicionalColocacion: any;
  @Input() esEditableHorario!: boolean;
  @Output() banderaNuevoEspacio = new EventEmitter<boolean>();

  listaCargaLectiva: any[] = [];
  listaEspaciosFisicosOcupados: any[] = [];

  readonly horarioSize = {
    days: 7,
    hourIni: 6,
    hourEnd: 23,
    difHoras: 23 - 6,
    stepHour: 0.25,
  };
  readonly containerGridLengths = {
    x: this.horarioSize.days,
    y: this.horarioSize.hourEnd - this.horarioSize.hourIni,
  };
  readonly snapGridSize = { x: 110, y: 90, ymin: 90 * 0.25 }; //px no olvide editarlas en scss si las cambia
  readonly containerGridsize = {
    x: this.containerGridLengths.x * this.snapGridSize.x,
    y: this.containerGridLengths.y * this.snapGridSize.y,
  };
  readonly tipo = { carga_lectiva: 1, actividades: 2 };
  readonly estado = { flotando: 1, ubicado: 2, ocupado: 3 };

  matrixBusy = Array(this.containerGridLengths.x)
    .fill(0)
    .map(() =>
      Array(this.containerGridLengths.y / this.horarioSize.stepHour)
        .fill(0)
        .map(() => false)
    );

  private dragEnabled = false;

  constructor(
    public dialog: MatDialog,
    private horarioService: HorarioService,
    private horarioMid: HorarioMidService,
    private planDocenteService: TrabajoDocenteService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.cargarColocaciones();
  }

  cargarColocaciones() {
    this.horarioMid
      .get(
        'colocacion-espacio-academico?grupo-estudio-id=' +
          this.infoAdicionalColocacion.grupoEstudio._id +
          '&periodo-id=' +
          this.infoAdicionalColocacion.periodo.Id
      )
      .subscribe((res: any) => {
        if (res.Success && res.Data.length > 0) {
          this.listaCargaLectiva = [];
          res.Data.forEach((colocacionRes: any) => {
            const colocacionEspacio = this.construirObjetoCardDetalleCarga(
              colocacionRes,
              this.infoAdicionalColocacion
            );
            this.listaCargaLectiva.push(colocacionEspacio);
          });
        }
      });
  }

  construirObjetoCardDetalleCarga(
    colocacionRes: any,
    infoAdicionalColocacion: any
  ): any {
    const resumen = colocacionRes.ResumenColocacionEspacioFisico;
    const colocacion = resumen.colocacion;
    if (resumen && colocacion && resumen.espacio_fisico) {
      const colocacionEspacio = {
        ...resumen.colocacion,
        ...resumen.espacio_fisico,
      };
      colocacionEspacio.id = colocacionRes._id;
      colocacionEspacio.nombre = `${colocacionRes.EspacioAcademico.nombre} (${colocacionRes.EspacioAcademico.grupo})`;
      colocacionEspacio.proyecto = infoAdicionalColocacion.proyecto;
      colocacionEspacio.cargaPlanId = colocacionRes.CargaPlanId;
      colocacionEspacio.espacioAcademicoId = colocacionRes.EspacioAcademicoId;
      const coord = this.getPositionforMatrix(colocacion);
      this.changeStateRegion(coord.x, coord.y, colocacion.horas, true);
      colocacionEspacio.estado = this.estado.ubicado;

      if (colocacionRes.Docente) {
        colocacionEspacio.docenteName =
          colocacionRes.Docente.NombreCompleto.toLowerCase().replace(
            /(^|\s)\S/g,
            (l: string) => l.toUpperCase()
          );
      }

      return colocacionEspacio;
    }
  }

  getDragPosition(eventDrag: CdkDragMove) {
    const contenedor: DOMRect =
      this.contenedorCargaLectiva.nativeElement.getBoundingClientRect();
    let posicionRelativa = {
      x: Math.floor(
        eventDrag.pointerPosition.x - contenedor.left - this.snapGridSize.x / 2
      ),
      y: Math.floor(
        eventDrag.pointerPosition.y - contenedor.top - this.snapGridSize.ymin
      ),
    };
    posicionRelativa.x = posicionRelativa.x <= 0 ? 0 : posicionRelativa.x;
    posicionRelativa.y = posicionRelativa.y <= 0 ? 0 : posicionRelativa.y;
    posicionRelativa.x =
      Math.round(posicionRelativa.x / this.snapGridSize.x) *
      this.snapGridSize.x;
    posicionRelativa.y =
      Math.round(posicionRelativa.y / this.snapGridSize.ymin) *
      this.snapGridSize.ymin;
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
      if (x >= 0) {
        this.matrixBusy[x][index] = state;
      }
    }
  }

  isInsideGrid(element: CardDetalleCarga) {
    const left = 0 <= element.finalPosition.x;
    const right = element.finalPosition.x < this.containerGridsize.x;
    const top = 0 <= element.finalPosition.y;
    const bottom = element.finalPosition.y < this.containerGridsize.y;
    return left && right && top && bottom;
  }

  getPositionforMatrix(element: CardDetalleCarga) {
    const x = Math.floor(element.finalPosition.x / this.snapGridSize.x);
    const y = Math.floor(element.finalPosition.y / this.snapGridSize.ymin);
    return { x, y };
  }

  genHoursforTable() {
    return Array(this.horarioSize.hourEnd - this.horarioSize.hourIni)
      .fill(0)
      .map((_, index) => index + this.horarioSize.hourIni);
  }

  deleteElement(htmlElement: any, elementClicked: CardDetalleCarga) {
    if (elementClicked.bloqueado) {
      return;
    }
    this.popUpManager
      .showPopUpGeneric(
        this.translate.instant('ptd.borrar'),
        this.translate.instant('ptd.ask_borrar'),
        MODALS.QUESTION,
        true
      )
      .then((action) => {
        if (action.value) {
          if (this.isInsideGrid(elementClicked)) {
            const coord = this.getPositionforMatrix(elementClicked);
            this.changeStateRegion(
              coord.x,
              coord.y,
              elementClicked.horas,
              false
            );
          }
          const idx = this.listaCargaLectiva.findIndex(
            (element) => element.id == elementClicked.id
          );
          this.listaCargaLectiva.splice(idx, 1);
          if (elementClicked.id) {
            this.horarioService
              .delete('colocacion-espacio-academico', elementClicked.id)
              .subscribe((response: any) => {
                if (response.Success && elementClicked.cargaPlanId) {
                  this.planDocenteService
                    .delete('carga_plan', elementClicked.cargaPlanId)
                    .subscribe((res: any) => {
                      if (res.Success) {
                      }
                    });
                }
              });
          }
          const c: Element = this.contenedorCargaLectiva.nativeElement;
          if (htmlElement.parentElement.parentElement) {
            c.removeChild(htmlElement.parentElement.parentElement);
          }
        }
      });
  }

  onDragStarted(elementMoved: CardDetalleCarga) {
    this.limpiarListaEspaciosFisicosOcupados();
    const periodoId = this.infoAdicionalColocacion.periodo.Id;
    const espacioFisicoId = elementMoved.salon.Id;

    // Desactiva el drag and drop
    this.dragEnabled = false;

    this.horarioMid
      .get(
        `espacio-fisico/ocupados?espacio-fisico-id=${espacioFisicoId}&periodo-id=${periodoId}`
      )
      .subscribe((res: any) => {
        if (res.Success && res.Data.length > 0) {
          res.Data.forEach((element: any) => {
            const ocupado: any = {
              horas: element.horas,
              estado: this.estado.ubicado,
              dragPosition: element.finalPosition,
              prevPosition: element.finalPosition,
              finalPosition: element.finalPosition,
            };
            if (
              !this.listaCargaLectiva.some((carga) => carga.id === element._id)
            ) {
              const coord = this.getPositionforMatrix(ocupado);
              this.changeStateRegion(coord.x, coord.y, ocupado.horas, true);
              this.listaEspaciosFisicosOcupados.push(ocupado);
            }
          });
        }
        this.dragEnabled = true;
      });
  }

  onDragMoved(event: CdkDragMove, elementMoved: CardDetalleCarga) {
    if (!this.dragEnabled) {
      event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
      return;
    }

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
    if (
      posicionRelativa.x != elementMoved.prevPosition.x ||
      posicionRelativa.y != elementMoved.prevPosition.y
    ) {
      elementMoved.prevPosition = elementMoved.dragPosition;
      elementMoved.horaFormato = this.calculateTimeSpan(
        elementMoved.dragPosition,
        elementMoved.horas
      );
    }
  }

  onDragReleased(event: CdkDragRelease, elementMoved: CardDetalleCarga) {
    this.limpiarListaEspaciosFisicosOcupados();
    if (!this.dragEnabled) {
      elementMoved.dragPosition = elementMoved.prevPosition;
      elementMoved.finalPosition = elementMoved.prevPosition;
      event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
      return;
    }
    this.popUpManager
      .showPopUpGeneric(
        this.translate.instant('ptd.asignar'),
        this.translate.instant('ptd.ask_mover') +
          '<br>' +
          elementMoved.horaFormato +
          '?',
        MODALS.QUESTION,
        true
      )
      .then((action) => {
        if (action.value) {
          elementMoved.estado = this.estado.ubicado;
          elementMoved.finalPosition = elementMoved.dragPosition;
          elementMoved.dia = this.calcularDia(elementMoved);
          if (this.isInsideGrid(elementMoved)) {
            const coord = this.getPositionforMatrix(elementMoved);
            this.changeStateRegion(coord.x, coord.y, elementMoved.horas, true);
          }
          this.crearModificarColocacion(elementMoved);
        } else {
          if (this.isInsideGrid(elementMoved)) {
            const coord = this.getPositionforMatrix(elementMoved);
            this.changeStateRegion(coord.x, coord.y, elementMoved.horas, true);
            elementMoved.estado = this.estado.ubicado;
          }
          elementMoved.dragPosition = elementMoved.finalPosition;
          elementMoved.prevPosition = elementMoved.dragPosition;
          elementMoved.finalPosition = elementMoved.dragPosition;
          event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
          event.source._dragRef.disabled = true;
          event.source
            .getRootElement()
            .scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
  }

  calculateTimeSpan(dragPosition: CoordXY, h: number): string {
    const iniTimeRaw =
      dragPosition.y / this.snapGridSize.y + this.horarioSize.hourIni;
    const finTimeRaw = iniTimeRaw + h;
    const horaI = Math.floor(iniTimeRaw);
    const minI = (iniTimeRaw - horaI) * 60;
    const horaF = Math.floor(finTimeRaw);
    const minF = (finTimeRaw - horaF) * 60;
    return (
      String(horaI).padStart(2, '0') +
      ':' +
      String(minI).padEnd(2, '0') +
      ' - ' +
      String(horaF).padStart(2, '0') +
      ':' +
      String(minF).padEnd(2, '0')
    );
  }

  crearModificarColocacion(espacio: CardDetalleCarga) {
    const colocacionEspacio = this.construirObjetoColocacionEspacio(espacio);

    if (espacio.id == null) {
      this.horarioService
        .post('colocacion-espacio-academico', colocacionEspacio)
        .subscribe((res: any) => {
          espacio.id = res.Data._id;
        });
    } else {
      this.horarioService
        .put('colocacion-espacio-academico/' + espacio.id, colocacionEspacio)
        .subscribe((res: any) => {});
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
      finalPosition: espacio.finalPosition,
    });

    const resumenColocacionEspacioFisico = JSON.stringify({
      colocacion: JSON.parse(colocacionEspacioAcademico),
      espacio_fisico: {
        edificio_id: espacio.edificio.Id,
        salon_id: espacio.salon.Id,
        sede_id: espacio.sede.Id,
      },
    });

    const colocacioEspacio = {
      EspacioAcademicoId: espacio.espacioAcademicoId,
      EspacioFisicoId: espacio.salon.Id,
      ColocacionEspacioAcademico: colocacionEspacioAcademico,
      ResumenColocacionEspacioFisico: resumenColocacionEspacioFisico,
      GrupoEstudioId: this.infoAdicionalColocacion.grupoEstudio._id,
      Activo: true,
    };

    return colocacioEspacio;
  }

  calcularDia(elementMoved: CardDetalleCarga) {
    const diasDeLaSemana = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    const dia = Math.floor(elementMoved.dragPosition.x / this.snapGridSize.x);
    const nombreDia = diasDeLaSemana[dia];
    return nombreDia;
  }

  addCarga() {
    const salon = this.infoEspacio.salon;
    const x = this.snapGridSize.x * -2.25;
    const y = 0;
    const newElement: CardDetalleCarga = {
      id: null,
      nombre: this.infoEspacio.grupoEspacio.Nombre,
      espacioAcademicoId: this.infoEspacio.grupoEspacio._id,
      sede: this.infoEspacio.facultad,
      edificio: this.infoEspacio.bloque,
      salon: salon || '-',
      horas: this.infoEspacio.horas,
      horaFormato: '',
      proyecto: this.infoAdicionalColocacion.proyecto,
      tipo: this.tipo.carga_lectiva,
      estado: this.estado.flotando,
      bloqueado: false,
      dragPosition: { x: x, y: y },
      prevPosition: { x: x, y: y },
      finalPosition: { x: x, y: y },
    };
    this.listaCargaLectiva.push(newElement);
  }

  abrirDialogoDetalleEspacio(infoEspacio: any) {
    const dialogRef = this.dialog.open(DetalleEspacioDialogComponent, {
      data: {
        ...infoEspacio,
        ...this.infoAdicionalColocacion,
      },
      width: '50%',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((docenteAsignado) => {
      if (docenteAsignado) {
        this.cargarColocaciones();
      }
    });
  }

  abrirDialogoEditarEspacio(infoEspacio: any) {
    console.log(infoEspacio);
    const dialogRef = this.dialog.open(EditarEspacioDialogComponent, {
      data: infoEspacio,
      width: '60%',
      height: 'auto',
    });

    dialogRef.afterClosed().subscribe((infoEditada) => {
      if (infoEditada && infoEditada.id) {
        this.procesarEdicionEspacio(infoEditada, infoEspacio);
      }
    });
  }

  procesarEdicionEspacio(infoEditada: any, infoEspacio: any) {
    const espacio = this.listaCargaLectiva.find(
      (esp: any) => esp.id === infoEditada.id
    );
    if (espacio) {
      // Este bloque if
      // Reinicia la colocación y libera el espacio en la matriz para evitar sobreposiciones al editar,
      // obligando al usuario a verificar nuevamente con la colocación actualizada.
      const coord = this.getPositionforMatrix(infoEspacio);
      this.changeStateRegion(coord.x, coord.y, infoEspacio.horas, false);

      const x = this.snapGridSize.x * -2.25;
      const y = infoEspacio.finalPosition.y;
      Object.assign(espacio, {
        sede: infoEditada.facultad,
        edificio: infoEditada.bloque,
        salon: infoEditada.salon,
        horas: infoEditada.horas,
        horaFormato: '',
        dragPosition: { x: x, y: y },
        prevPosition: { x: x, y: y },
        finalPosition: { x: x, y: y },
      });
    }
    this.crearModificarColocacion(espacio);
  }

  nuevoEspacio() {
    this.banderaNuevoEspacio.emit(true);
  }

  limpiarListaEspaciosFisicosOcupados() {
    if (this.listaEspaciosFisicosOcupados.length > 0) {
      this.listaEspaciosFisicosOcupados.forEach((ocupado) => {
        const coord = this.getPositionforMatrix(ocupado);
        this.changeStateRegion(coord.x, coord.y, ocupado.horas, false);
      });
      this.listaEspaciosFisicosOcupados = [];
    }
  }
}
