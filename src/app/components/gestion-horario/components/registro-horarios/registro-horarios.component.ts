import { Parametros } from '../../../../../utils/Parametros';
import { PopUpManager } from '../../../../managers/popUpManager';
import { HorarioMidService } from '../../../../services/horario-mid.service';
import { ordenarPorPropiedad } from '../../../../../utils/listas';
import { HorarioComponent } from './components/horario/horario.component';
import { MatStepper } from '@angular/material/stepper';
import { selectsPasoDos, selectsPasoUno } from './utilidades';
import { GestionExistenciaHorarioService } from '../../../../services/gestion-existencia-horario.service';
import { TrabajoDocenteMidService } from '../../../../services/trabajo-docente-mid.service';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  establecerSelectsSecuenciales,
  limpiarErroresDeFormulario,
  reiniciarFormulario,
} from '../../../../../utils/formularios';

@Component({
  selector: 'udistrital-registro-horarios',
  templateUrl: './registro-horarios.component.html',
  styleUrl: './registro-horarios.component.scss',
})
export class RegistroHorariosComponent implements OnInit {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  @ViewChild(HorarioComponent) HorarioComponent!: HorarioComponent;
  @ViewChild('stepper') private stepper!: MatStepper;
  @Input() dataParametrica: any;
  @Output() volverASelects = new EventEmitter<boolean>();

  selectsPasoUno: any;
  selectsPasoDos: any;

  formPaso1!: FormGroup;
  formPaso2!: FormGroup;

  infoEspacio: any;
  bloques: any;
  espaciosAcademicos: any;
  informacionParaPasoDos: any;
  gruposEstudio: any;
  horario: any;
  facultades: any;
  periodos: any;
  salones: any;
  semestresDePlanEstudio: any;

  //proyecto, grupoEstudio, horarioSemestreId, periodo, nivel
  infoAdicionalColocacion: any;

  banderaHorario = false;
  esEditableHorario = false;

  constructor(
    private _formBuilder: FormBuilder,
    private horarioMid: HorarioMidService,
    private gestionExistenciaHorario: GestionExistenciaHorarioService,
    private translate: TranslateService,
    private planTrabajoDocenteMid: TrabajoDocenteMidService,
    private parametros: Parametros,
    private popUpManager: PopUpManager
  ) {}

  ngOnInit() {
    this.cargarSemestresSegunPlanEstudio(this.dataParametrica.planEstudio);
    this.iniciarFormularios();
  }

  volverASelectsParametrizables() {
    this.volverASelects.emit(true);
  }

  iniciarFormularios() {
    this.iniciarFormPaso1();
    this.iniciarFormPaso2();
  }

  iniciarFormPaso1() {
    this.formPaso1 = this._formBuilder.group({
      semestre: ['', Validators.required],
      grupoEstudio: ['', Validators.required],
    });
    this.selectsPasoUno = selectsPasoUno;
    establecerSelectsSecuenciales(this.formPaso1);
  }

  iniciarFormPaso2() {
    this.formPaso2 = this._formBuilder.group({
      grupoEspacio: ['', Validators.required],
      facultad: ['', Validators.required],
      bloque: ['', Validators.required],
      salon: ['', Validators.required],
      horas: ['', [Validators.required, this.horaValidador()]],
    });
    this.selectsPasoDos = selectsPasoDos;
    this.cargarInformacionParaPasoDos();
    establecerSelectsSecuenciales(this.formPaso2, [
      'facultad',
      'bloque',
      'salon',
    ]);
  }

  listarGruposEstudioSegunParametros() {
    const horarioId = this.horario._id;
    const semestre = this.formPaso1.get('semestre')?.value;
    this.horarioMid
      .get(
        'grupo-estudio?horario-id=' + horarioId + '&semestre-id=' + semestre.Id
      )
      .subscribe((res: any) => {
        if (res.Success) {
          if (res.Data.length > 0) {
            this.gruposEstudio = ordenarPorPropiedad(res.Data, 'Nombre', 1);
          } else {
            this.gruposEstudio = [];
            this.espaciosAcademicos = [];
            reiniciarFormulario(this.formPaso2);
            this.popUpManager.showAlert(
              '',
              this.translate.instant('gestion_horarios.no_grupos_registrados')
            );
          }
        }
      });
  }

  listarEspaciosDeGrupoEstudio(grupo: any) {
    this.banderaHorario = false;
    this.infoAdicionalColocacion = {
      proyecto: this.dataParametrica.proyecto,
      grupoEstudio: this.formPaso1.get('grupoEstudio')?.value,
      periodo: this.dataParametrica.periodo,
      actividadesCalendario: this.dataParametrica.actividadesCalendario,
      nivel: this.dataParametrica.nivel,
    };
    this.espaciosAcademicos = grupo.EspaciosAcademicos.activos.map(
      (espacio: any) => {
        espacio.Nombre = espacio.nombre + ' (' + espacio.grupo + ')';
        return espacio;
      }
    );

    setTimeout(() => {
      this.banderaHorario = true;
    }, 10);
  }

  cargarSemestresSegunPlanEstudio(planEstudio: any) {
    this.parametros
      .semestresSegunPlanEstudio(planEstudio)
      .subscribe((res: any) => {
        this.semestresDePlanEstudio = res;
        this.consultarExistenciaDeHorario();
      });
  }

  cargarInformacionParaPasoDos() {
    const dependenciaId = this.dataParametrica.proyecto.DependenciaId;
    this.planTrabajoDocenteMid
      .get('espacio-fisico/dependencia?dependencia=' + dependenciaId)
      .subscribe((res: any) => {
        this.informacionParaPasoDos = res.Data;
        this.facultades = res.Data.Sedes;
      });
  }

  cargarBloquesSegunFacultad(sede: any) {
    const facultadId = sede.Id;
    this.bloques = this.informacionParaPasoDos.Edificios[facultadId];
  }

  cargarSalonesSegunBloque(edificio: any) {
    const edificioId = edificio.Id;
    this.salones = this.informacionParaPasoDos.Salones[edificioId];
  }

  enviarInfoParaColocacion() {
    if (this.formPaso2.invalid) {
      this.formPaso2.markAllAsTouched();
      return;
    }

    this.infoEspacio = {
      ...this.formPaso1.value,
      ...this.formPaso2.value,
    };
    setTimeout(() => {
      this.HorarioComponent.addCarga();
    }, 10);
  }

  nuevoEspacio(evento: boolean) {
    if (evento) {
      this.formPaso2.reset();
      this.stepper.selectedIndex = 1;
    }
  }

  consultarExistenciaDeHorario() {
    const proyecto = this.dataParametrica.proyecto;
    const plan = this.dataParametrica.planEstudio;
    const periodo = this.dataParametrica.periodo;
    this.gestionExistenciaHorario.gestionarHorario(
      proyecto,
      plan,
      periodo,
      this.semestresDePlanEstudio,
      (horario: any) => {
        if (horario) {
          this.horario = horario;
          this.verificarCalendarioParaGestionHorario();
        } else {
          this.volverASelectsParametrizables();
        }
      }
    );
  }

  horaValidador(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const horas = control.value;
      if (horas < 0.5) {
        return {
          errorHora: this.translate.instant(
            'gestion_horarios.cantidad_horas_min'
          ),
        };
      }
      if (horas > 8) {
        return {
          errorHora:
            this.translate.instant('gestion_horarios.cantidad_horas_max') +
            ' 8',
        };
      }
      if (horas % 0.25 !== 0) {
        return {
          errorHora: this.translate.instant(
            'gestion_horarios.cantidad_horas_multiplo_0.25'
          ),
        };
      }
      return null;
    };
  }

  verificarCalendarioParaGestionHorario() {
    const actividadGestionHorario =
      this.dataParametrica.actividadesCalendario
        ?.actividadesGestionHorario?.[0];
    if (actividadGestionHorario == null) {
      return this.popUpManager.showAlert(
        '',
        this.translate.instant(
          'gestion_horarios.no_definido_proceso_para_horario_calendario'
        )
      );
    }

    if (!actividadGestionHorario.DentroFechas) {
      return this.popUpManager.showAlert(
        '',
        this.translate.instant('gestion_horarios.no_dentro_fechas_para_horario')
      );
    }
    this.esEditableHorario = true;
  }

  verificarSiEspacioTieneColocacionEnPlanDocente() {
    this.infoEspacio = {
      grupoEspacio: this.formPaso2.value.grupoEspacio,
    };

    setTimeout(() => {
      this.HorarioComponent.verificarSiEspacioTieneColocacionEnPlanDocente();
    }, 10);
  }

  controlarEspacioTieneColocacionEnPlanDocente(evento: boolean) {
    if (evento) {
      this.stepper.selectedIndex = 2;
      this.popUpManager.showAlert(
        this.translate.instant(
          'gestion_horarios.mensaje_si_espacio_tiene_colocacion_en_plan_docente_1'
        ),
        this.translate.instant(
          'gestion_horarios.mensaje_si_espacio_tiene_colocacion_en_plan_docente_2'
        )
      );
    }
  }
}
