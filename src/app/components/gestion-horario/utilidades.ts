export const selectsParametrizados = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'nivel', label: 'ptd.select_nivel', icon: 'layers_icon', options: 'niveles', onChange: 'cargarSubnivelesSegunNivel' },
    { name: 'subnivel', label: 'ptd.select_subnivel', icon: 'sort', options: 'subniveles', onChange: 'cargarProyectosSegunSubnivel' },
    { name: 'proyecto', label: 'ptd.select_proyecto_curricular', icon: 'folder_open', options: 'proyectos', onChange: 'cargarPlanesEstudioSegunProyectoCurricular' },
    { name: 'planEstudio', label: 'ptd.select_plan_estudios', icon: 'school', options: 'planesEstudios', onChange: 'cargarSemestresSegunPlanEstudio' },
    { name: 'semestre', label: 'ptd.select_semestre_academico', icon: 'blur_linear', options: 'semestres', onChange: '' },
];

export const cartasAcciones = [
    // action parametro de la funcion cambioSuiteGeneral()
    { action: 'gestionGrupos', icon: 'supervisor_account', label: 'gestion_horarios.boton_1', descripcion: 'gestion_horarios.descripcion_gestion_horarios' },
    { action: 'registrarHorario', icon: 'assignment', label: 'gestion_horarios.boton_2', descripcion: 'gestion_horarios.descripcion_registrar_horario' },
    { action: 'copiarHorario', icon: 'view_carousel', label: 'gestion_horarios.boton_3', descripcion: 'gestion_horarios.descripcion_copiar_horario' },
    { action: 'listarHorarios', icon: 'list', label: 'gestion_horarios.boton_4', descripcion: 'gestion_horarios.descripcion_listar_horarios' },
    { action: 'reporteHorarios', icon: 'save_alt', label: 'gestion_horarios.boton_5', descripcion: 'gestion_horarios.descripcion_reporte_horarios' }
  ];