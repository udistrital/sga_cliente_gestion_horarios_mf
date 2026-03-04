import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import {
  ACTIONS,
  MODALS,
  ROLES,
  VIEWS,
} from '../../models/diccionario/diccionario';
import { HttpErrorResponse } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../theme/ng2-st-button/ng2-st-button.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProyectoAcademicoService } from '../../services/proyecto_academico.service';
import { ParametrosService } from '../../services/parametros.service';
import { EspacioAcademicoService } from '../../services/espacio-academico.service';
import { HorarioMidService } from '../../services/horario-mid.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Parametros } from '../../../utils/Parametros';
import { selectsParametrizados } from './utilidades';
import { HorarioService } from '../../services/horario.service';

@Component({
  selector: 'udistrital-horario-por-grupos',
  templateUrl: './horario-por-grupos.component.html',
  styleUrl: './horario-por-grupos.component.scss',
})
export class HorarioPorGruposComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'index',
    'nombre',
    'codigo',
    'estado',
    'grupo',
    'cupos',
    'inscritos',
    'dia',
    'hora',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading!: boolean;

  readonly VIEWS = VIEWS;
  vista!: Symbol;

  tbDiponibilidadHorarios!: Object;

  formStep1!: FormGroup;
  formDef: any;
  //Listas para los select parametricos
  niveles!: any;
  subniveles!: any;
  proyectos!: any;
  planesEstudios!: any;
  semestres!: any;
  periodos: any;
  espaciosAcademicos!: any[];
  grupos!: any[];
  //Valores seleccionados de los select parametricos
  selectsParametrizados: any;
  [key: string]: any;

  readonly ACTIONS = ACTIONS;
  crear_editar!: Symbol;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private formBuilder: FormBuilder,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private espacioAcademicoService: EspacioAcademicoService,
    private horarioMidService: HorarioMidService,
    private horarioService: HorarioService,
    private parametros: Parametros
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
      this.updateLanguage();
    });
  }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.iniciarFormularioConsulta();
    this.selectsParametrizados = selectsParametrizados;
    this.cargarNiveles();
    this.cargarPeriodos();

    // load additional selects unique to this component
    // (Ahora se cargan via cargarGruposYEspacios al cambiar el semestre o periodo)

    this.createTable();

    this.dataSource = new MatTableDataSource<any>(
      this.tbDiponibilidadHorarios as any[]
    );
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // * ----------
  // * Creación de tabla (lista espacios_academicos)
  //#region
  createTable() {
    this.tbDiponibilidadHorarios = {
      columns: {
        index: {
          title: '#',
          filter: false,
          valuePrepareFunction: (value: any, row: any, cell: any) => {
            return cell.row.index + 1;
          },
          width: '2%',
        },
        nombre: {
          title: this.translate.instant('gestion_horarios.periodo_academico'),
          editable: false,
          width: '5%',
          filter: true,
        },
        codigo: {
          title: this.translate.instant('gestion_horarios.sede'),
          editable: false,
          width: '15%',
          filter: true,
        },
        estado: {
          title: this.translate.instant('gestion_horarios.edificio'),
          editable: false,
          width: '15%',
          filter: true,
        },
        grupo: {
          title: this.translate.instant('gestion_horarios.salon'),
          editable: false,
          width: '8%',
          filter: true,
        },
        cupos: {
          title: this.translate.instant('gestion_horarios.proyecto_academico'),
          editable: false,
          width: '12%',
          filter: true,
        },
        inscritos: {
          title: this.translate.instant('gestion_horarios.espacio_academico'),
          editable: false,
          width: '12%',
          filter: true,
        },
        dia: {
          title: this.translate.instant('gestion_horarios.dia'),
          editable: false,
          width: '8%',
          filter: true,
        },
        hora: {
          title: this.translate.instant('gestion_horarios.hora'),
          editable: false,
          width: '8%',
          filter: true,
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found'),
    };
  }

  iniciarFormularioConsulta() {
    this.formStep1 = this.formBuilder.group({
      nivel: ['', Validators.required],
      subnivel: ['', Validators.required],
      proyecto: ['', Validators.required],
      planEstudio: ['', Validators.required],
      semestre: ['', Validators.required],
      periodo: ['', Validators.required],
      espacioacademico: [''],
      grupo: ['', Validators.required]
    });
  }

  updateLanguage() {
    // Left empty since translation of selects is done in template via selectsParametrizados
  }

  cargarNiveles() {
    this.parametros.niveles().subscribe((res: any) => {
      this.niveles = res
    })
  }

  cargarSubnivelesSegunNivel(nivel: any) {
    this.parametros.subnivelesSegunNivel(nivel).subscribe((res: any) => {
      this.subniveles = res
    })
  }

  cargarProyectosSegunSubnivel(subnivel: any) {
    this.parametros.proyectosSegunSubnivel(subnivel).subscribe((res: any) => {
      this.proyectos = res
    })
  }

  cargarPlanesEstudioSegunProyectoCurricular(proyecto: any) {
    this.parametros.planesEstudioSegunProyectoCurricular(proyecto).subscribe((res: any) => {
      this.planesEstudios = res
    })
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros.semestresSegunPlanEstudio(planEstudio).subscribe((res: any) => {
      this.semestres = res
    })
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res
    })
  }

  cargarGruposYEspacios(selectedValue?: any) {
    const formVals = this.formStep1.value;
    const proyectoId = formVals.proyecto?.Id;
    const planEstudioId = formVals.planEstudio?.Id;
    const periodoId = formVals.periodo?.Id;
    const semestreId = formVals.semestre?.Id;

    if (proyectoId && planEstudioId && periodoId && semestreId) {
      this.loading = true;
      const queryStr = `ProyectoAcademicoId:${proyectoId},PlanEstudioId:${planEstudioId},PeriodoId:${periodoId},Activo:true`;

      this.horarioService.get(`horario?query=${queryStr}&limit=0`).subscribe({
        next: (res: any) => {
          let horarioId = null;
          if (res && res.Data && res.Data.length > 0 && res.Data[0]._id !== undefined) {
            horarioId = res.Data[0]._id;
          } else if (res && res.length > 0 && res[0]._id !== undefined) {
            horarioId = res[0]._id;
          }

          if (horarioId) {
            this.horarioMidService.get(`grupo-estudio?horario-id=${horarioId}&semestre-id=${semestreId}`).subscribe({
              next: (midRes: any) => {
                this.loading = false;
                let midData = [];
                if (midRes && midRes.Data) {
                  midData = midRes.Data;
                } else if (Array.isArray(midRes)) {
                  midData = midRes;
                }

                // Mapear los grupos devueltos para el Select de 'Grupo'
                this.grupos = midData.map((grupo: any) => ({
                  ...grupo,
                  Nombre: grupo.Nombre || grupo.nombre,
                  Id: grupo._id || grupo.Id
                }));

                // Se inicializa el select de espacios en vacío. 
                // Se actualizará al seleccionar un grupo.
                this.espaciosAcademicos = [];
              },
              error: (midErr) => {
                this.loading = false;
                this.grupos = [];
                this.espaciosAcademicos = [];
              }
            });
          } else {
            this.loading = false;
            this.grupos = [];
            this.espaciosAcademicos = [];
          }
        },
        error: (err) => {
          this.loading = false;
          this.grupos = [];
          this.espaciosAcademicos = [];
        }
      });
    }
  }

  cargarInfoEspacioAcademico(espacioAcademicoSeleccionado: any) {
    if (espacioAcademicoSeleccionado && espacioAcademicoSeleccionado.Id) {
      const id = espacioAcademicoSeleccionado.Id;
      this.espacioAcademicoService.get(`espacio-academico/${id}`).subscribe({
        next: (res: any) => {
          console.log("Información del espacio académico:", res);
        },
        error: (err) => {
          console.error("Error al obtener la información del espacio académico", err);
        }
      });
    }
  }

  cargarEspaciosAcademicosPorGrupo(grupoSeleccionado: any) {
    if (grupoSeleccionado && grupoSeleccionado.EspaciosAcademicos && grupoSeleccionado.EspaciosAcademicos.activos) {
      let espaciosSet = new Map();
      grupoSeleccionado.EspaciosAcademicos.activos.forEach((espacio: any) => {
        if (!espaciosSet.has(espacio._id)) {
          espaciosSet.set(espacio._id, {
            Nombre: espacio.nombre + ' (Grupo ' + espacio.grupo + ')',
            Id: espacio._id
          });
        }
      });
      this.espaciosAcademicos = Array.from(espaciosSet.values());
    } else {
      this.espaciosAcademicos = [];
    }
    this.formStep1.get('espacioacademico')?.setValue('');
  }

  consultarHorariosGrupos() {
    if (this.formStep1.invalid) {
      return;
    }

    this.loading = true;
    const formVals = this.formStep1.value;
    const grupoEstudioId = formVals.grupo.Id;
    const periodoId = formVals.periodo.Id;

    this.horarioMidService
      .get(`colocacion-espacio-academico?grupo-estudio-id=${grupoEstudioId}&periodo-id=${periodoId}`)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          let colocacionesData: any[] = [];

          if (res && res.Data && res.Data.length > 0) {
            colocacionesData = res.Data;

            // Si hay un espacio académico seleccionado se filtran los resultados
            if (formVals.espacioacademico && formVals.espacioacademico.Id) {
              colocacionesData = colocacionesData.filter(colocacion =>
                colocacion.EspacioAcademico && colocacion.EspacioAcademico._id === formVals.espacioacademico.Id
              );
            }
          }

          // Generar colores únicos por EspacioAcademicoId para la tabla
          const colores = [
            '#E3F2FD', // Azul claro
            '#FFF3E0', // Naranja claro
            '#E8F5E9', // Verde claro
            '#F3E5F5', // Morado claro
            '#FFEBEE', // Rojo claro
            '#E0F7FA', // Cian claro
            '#FCE4EC', // Rosa claro
            '#F4F6F6', // Gris claro
            '#FFFDE7', // Amarillo claro
            '#E8EAF6'  // Indigo claro
          ];
          let colorIndex = 0;
          const mapaColores = new Map<string, string>();

          const diasDeLaSemana = [
            'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
          ];

          let rows = colocacionesData.map((colocacion: any) => {
            const espacioId = colocacion.EspacioAcademico._id;
            if (!mapaColores.has(espacioId)) {
              mapaColores.set(espacioId, colores[colorIndex % colores.length]);
              colorIndex++;
            }
            const rowColor = mapaColores.get(espacioId);

            const colocacionFisica = colocacion.ResumenColocacionEspacioFisico.colocacion;
            const espacioFisico = colocacion.ResumenColocacionEspacioFisico.espacio_fisico;

            const dia = this.calcularDia(colocacionFisica);
            const hora = colocacionFisica.horaFormato; // Ej: "08:00 - 10:00"

            const diaIndex = diasDeLaSemana.indexOf(dia);

            // Para la hora tomaremos solo el primer bloque antes del -, eliminando los: "08:00" -> 800
            let horaNumeric = 0;
            if (hora) {
              const startHoraStr = hora.split('-')[0].trim();
              horaNumeric = Number(startHoraStr.replace(':', ''));
            }

            return {
              nombre: formVals.periodo.Nombre,
              codigo: espacioFisico.sede.Nombre,
              estado: espacioFisico.edificio.Nombre,
              grupo: espacioFisico.salon.Nombre,
              cupos: formVals.proyecto.Nombre,
              inscritos: colocacion.EspacioAcademico.nombre,
              dia: dia,
              hora: hora,
              color: rowColor,
              _diaIndex: diaIndex !== -1 ? diaIndex : 99,
              _horaNumeric: horaNumeric
            };
          });

          // Ordenar: primero por 'día', y si el día es igual, entonces por 'hora'
          rows.sort((a, b) => {
            if (a._diaIndex === b._diaIndex) {
              return a._horaNumeric - b._horaNumeric;
            }
            return a._diaIndex - b._diaIndex;
          });

          // Asignar el índice después del ordenamiento para que la numeración inicie en 1 secuencialmente
          rows = rows.map((row, idx) => ({ ...row, index: idx + 1 }));

          this.dataSource.data = rows;
        },
        error: (err) => {
          console.error("Error al obtener las colocaciones:", err);
          this.loading = false;
          this.dataSource.data = [];
        }
      });
  }

  calcularDia(colocacion: any): string {
    const diasDeLaSemana = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    //110 es el valor asignado para el grosor de una colocacion (basado en gestion-horario)
    const diaIndex = Math.floor(colocacion.dragPosition.x / 110);
    return diasDeLaSemana[diaIndex] || '';
  }

  async generarPDF() {
    const seccionResultados = document.getElementById('seccion-resultados');

    if (!seccionResultados) {
      this.popUpManager.showErrorAlert(
        this.translate.instant('GLOBAL.error'),
      );
      return;
    }

    // Mostrar loading con SweetAlert2
    Swal.fire({
      title: 'Generando reporte PDF...',
      text: 'Por favor espere mientras se genera el documento.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const optionsCanvas = {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      };

      const canvasResultados = await html2canvas(seccionResultados, optionsCanvas);

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      // --- Encabezado ---
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(
        this.translate.instant('gestion_horarios.encabezado_2'),
        pageWidth / 2,
        margin + 5,
        { align: 'center' }
      );

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const fechaGeneracion = new Date().toLocaleString('es-CO');
      pdf.text(
        `Fecha de generación: ${fechaGeneracion}`,
        pageWidth / 2,
        margin + 12,
        { align: 'center' }
      );

      let currentY = margin + 20;

      // --- Sección Definición de consulta (texto desde los valores del formulario) ---
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(
        this.translate.instant('gestion_horarios.header_parametros'),
        margin,
        currentY
      );
      currentY += 2;

      // Línea separadora
      pdf.setDrawColor(0, 128, 128);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;

      const formVals = this.formStep1.value;

      const filtros = [
        { label: this.translate.instant('ptd.select_nivel'), valor: formVals.nivel?.Nombre },
        { label: this.translate.instant('ptd.select_subnivel'), valor: formVals.subnivel?.Nombre },
        { label: this.translate.instant('ptd.select_proyecto_curricular'), valor: formVals.proyecto?.Nombre },
        { label: this.translate.instant('ptd.select_plan_estudios'), valor: formVals.planEstudio?.Nombre },
        { label: this.translate.instant('ptd.select_periodo_academico'), valor: formVals.periodo?.Nombre },
        { label: this.translate.instant('ptd.select_semestre_academico'), valor: formVals.semestre?.Nombre },
        { label: this.translate.instant('gestion_horarios.grupo'), valor: formVals.grupo?.Nombre },
        { label: this.translate.instant('gestion_horarios.espacio_academico'), valor: formVals.espacioacademico?.Nombre || 'Todos' },
      ];

      // Dibujar filtros en dos columnas con posiciones X fijas
      const colWidth = contentWidth / 2;
      const labelWidth = 58; // mm fijos para la zona del label
      const lineHeight = 7;

      for (let i = 0; i < filtros.length; i += 2) {
        const xLabelLeft = margin;
        const xValueLeft = margin + labelWidth;
        const xLabelRight = margin + colWidth;
        const xValueRight = margin + colWidth + labelWidth;

        // Columna izquierda — label
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${filtros[i].label}:`, xLabelLeft, currentY);

        // Columna izquierda — valor (posición X fija)
        pdf.setFont('helvetica', 'normal');
        pdf.text(filtros[i].valor || '-', xValueLeft, currentY);

        // Columna derecha (si existe)
        if (i + 1 < filtros.length) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${filtros[i + 1].label}:`, xLabelRight, currentY);
          pdf.setFont('helvetica', 'normal');
          pdf.text(filtros[i + 1].valor || '-', xValueRight, currentY);
        }

        currentY += lineHeight;
      }

      currentY += 6;

      // --- Sección Resultados de consulta ---
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');

      const imgResultados = canvasResultados.toDataURL('image/png');
      const ratioResultados = canvasResultados.height / canvasResultados.width;
      const imgResultadosHeight = contentWidth * ratioResultados;

      if (currentY + 10 > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.text(
        this.translate.instant('gestion_horarios.header_resultados'),
        margin,
        currentY
      );
      currentY += 2;

      // Línea separadora
      pdf.setDrawColor(0, 128, 128);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 4;

      // Si la tabla es muy alta, dividirla en múltiples páginas
      const availableHeight = pageHeight - currentY - margin;

      if (imgResultadosHeight <= availableHeight) {
        pdf.addImage(imgResultados, 'PNG', margin, currentY, contentWidth, imgResultadosHeight);
      } else {
        // Dividir la imagen de la tabla en segmentos
        let sourceY = 0;
        const sourceWidth = canvasResultados.width;
        const sourceHeight = canvasResultados.height;

        while (sourceY < sourceHeight) {
          const sliceAvailable = currentY === margin
            ? pageHeight - margin * 2
            : availableHeight;

          const sliceHeightPx = (sliceAvailable / contentWidth) * sourceWidth;
          const actualSlice = Math.min(sliceHeightPx, sourceHeight - sourceY);

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = sourceWidth;
          tempCanvas.height = actualSlice;

          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvasResultados,
              0, sourceY, sourceWidth, actualSlice,
              0, 0, sourceWidth, actualSlice
            );

            const sliceImg = tempCanvas.toDataURL('image/png');
            const sliceRatio = actualSlice / sourceWidth;
            const sliceHeight = contentWidth * sliceRatio;

            pdf.addImage(sliceImg, 'PNG', margin, currentY, contentWidth, sliceHeight);
          }

          sourceY += actualSlice;

          if (sourceY < sourceHeight) {
            pdf.addPage();
            currentY = margin;
          }
        }
      }

      // --- Generar nombre del archivo ---
      const proyecto = formVals.proyecto?.Nombre || 'proyecto';
      const grupo = formVals.grupo?.Nombre || 'grupo';
      const nombreArchivo = `Horario_${proyecto}_${grupo}_${fechaGeneracion.replace(/[/:, ]/g, '_')}.pdf`;

      pdf.save(nombreArchivo);

      // Cerrar loading y mostrar éxito
      Swal.fire({
        icon: 'success',
        title: this.translate.instant('GLOBAL.operacion_exitosa'),
        text: 'El reporte PDF ha sido generado exitosamente.',
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      Swal.close();
      this.popUpManager.showErrorAlert(
        'Error al generar el reporte PDF. Intente nuevamente.',
      );
    }
  }

  editElement(element: any) {
    // Lógica para editar un elemento
  }

  deleteElement(element: any) {
    // Lógica para eliminar un elemento
  }
}
