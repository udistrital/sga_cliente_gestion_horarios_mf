export const selectsPasoUno = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'periodo', label: 'ptd.select_periodo_academico', icon: 'today', options: 'periodos', onChange: '' },
    { name: 'grupoEstudio', label: 'gestion_horarios.placeholder_grupo', icon: 'supervisor_account', options: 'gruposEstudio', onChange: 'listarEspaciosDeGrupo' },
    { name: 'grupoEspacio', label: 'gestion_horarios.select_espacio_2', icon: 'dns', options: 'espaciosAcademicos', onChange: ''},
];

export const selectsPasoDos = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'facultad', label: 'gestion_horarios.select_facultad', icon: 'location_city', options: 'facultades', onChange: 'cargarBloquesSegunFacultad' },
    { name: 'bloque', label: 'gestion_horarios.select_bloque', icon: 'domain', options: 'bloques', onChange: 'cargarSalonesSegunBloque' },
    { name: 'salon', label: 'gestion_horarios.select_salon', icon: 'collections_bookmark', options: 'salones', onChange: '' },
];

export const inputsPasoTres = [
    // name: formControlName --- label: etiqueta que se muestra en el input --- icon: icono asociado al input --- type: tipo de input
    { name: 'documento', label: 'gestion_horarios.select_identificacion', icon: 'description', type: 'text' },
    { name: 'nombreDocente', label: 'gestion_horarios.select_nombre', icon: 'person',  type: 'text' },
    { name: 'vinculacion', label: 'gestion_horarios.select_vinculacion', icon: 'assignment_ind',  type: 'text' },
    { name: 'horas', label: 'gestion_horarios.select_horas', icon: 'access_time',  type: 'text' },
];
