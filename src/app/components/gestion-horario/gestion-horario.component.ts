import { Component } from '@angular/core';
import { ACTIONS, VIEWS } from '../../models/diccionario/diccionario';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parametros } from '../../../utils/Parametros';
import { cartasAcciones, selectsParametrizados } from './utilidades';
import { HorarioMidService } from '../../services/horario-mid.service';
import { establecerSelectsSecuenciales } from '../../../utils/formularios';


@Component({
  selector: 'udistrital-gestion-horario',
  templateUrl: './gestion-horario.component.html',
  styleUrl: './gestion-horario.component.scss'
})
export class GestionHorarioComponent {
  [key: string]: any; // Permitir el acceso dinámico con string keys

  actividadesCalendario: any
  formStep1!: FormGroup;
  //Listas para los select parametricos
  niveles!: any;
  planesEstudios!: any;
  proyectos!: any;
  periodos: any;
  semestres!: any;
  subniveles!: any;
  //Objeto agrupando los selects seleccionados
  dataParametrica: any

  banderaGestionGrupos: boolean = false;
  banderaRegistrarHorario: boolean = false;
  banderaCopiarHorario: boolean = true;
  banderaListarHorarios: boolean = false;
  //vista inicial
  banderaStepper: boolean = false;

  cartasAcciones:any
  selectsParametrizados:any

  readonly ACTIONS = ACTIONS;
  crear_editar!: Symbol;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private parametros: Parametros,
    private horarioMid: HorarioMidService,

  ) { }

  ngOnInit() {
    this.iniciarFormularioConsulta()
    this.cargarNiveles();
    //cargar las cartas para las acciones
    this.cartasAcciones = cartasAcciones
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
    this.cargarPeriodos()
  }

  cargarPeriodos() {
    this.parametros.periodos().subscribe((res: any) => {
      this.periodos = res
    })
  }

  cargarDataParaProximoPaso() {
    this.dataParametrica = this.formStep1.value
    this.obtenerCalendarioParaGestionHorario()
  }

  selectCalendario(event: any) {
    // Código del método aquí...
  }

  cambioSuiteGeneral(seleccion: any) {
    this.banderaStepper = false
    this.ocultarSuiteGeneral();
    const banderas: any = {
      gestionGrupos: () => this.banderaGestionGrupos = true,
      registrarHorario: () => this.banderaRegistrarHorario = true,
      copiarHorario: () => this.banderaCopiarHorario = true,
      listarHorarios: () => this.banderaListarHorarios = true
    };
    //se pone en true, dependiendo de seleccion
    (banderas[seleccion] || (() => { }))();
  }

  ocultarSuiteGeneral() {
    this.banderaGestionGrupos = false
    this.banderaRegistrarHorario = false
    this.banderaCopiarHorario = false
    this.banderaListarHorarios = false
  }

  mostrarSelectsParametrizables(mostrar: any){
    this.ocultarSuiteGeneral()
    this.banderaStepper = mostrar 
  }

  iniciarFormularioConsulta() {
    this.formStep1 = this.fb.group({
      nivel: ['', Validators.required],
      subnivel: ['', Validators.required],
      proyecto: ['', Validators.required],
      planEstudio: ['', Validators.required],
      periodo: ['', Validators.required],
    });
    this.selectsParametrizados = selectsParametrizados
    
    establecerSelectsSecuenciales(this.formStep1)
  }

  obtenerCalendarioParaGestionHorario() {
    const periodoId = this.dataParametrica.periodo.Id
    const nivelId = this.dataParametrica.nivel.Id
    const dependenciaId = this.dataParametrica.proyecto.Id
    this.horarioMid.get(`horario/calendario?periodo-id=${periodoId}&nivel-id=${nivelId}&dependencia-id=${dependenciaId}`).subscribe((res: any) => {
      if (res.Success) {
        this.actividadesCalendario = res.Data
        this.dataParametrica = {
          ...this.dataParametrica,
          actividadesCalendario: this.actividadesCalendario
        }
      }
    })
  }
}


