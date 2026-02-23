export const selectsParametrizados = [
    { name: 'nivel', label: 'ptd.select_nivel', icon: 'layers_icon', options: 'niveles', onChange: 'cargarSubnivelesSegunNivel' },
    { name: 'subnivel', label: 'ptd.select_subnivel', icon: 'sort', options: 'subniveles', onChange: 'cargarProyectosSegunSubnivel' },
    { name: 'proyecto', label: 'ptd.select_proyecto_curricular', icon: 'folder_open', options: 'proyectos', onChange: 'cargarPlanesEstudioSegunProyectoCurricular' },
    { name: 'planEstudio', label: 'ptd.select_plan_estudios', icon: 'school', options: 'planesEstudios', onChange: 'cargarSemestresSegunPlanEstudio' },
    { name: 'periodo', label: 'ptd.select_periodo_academico', icon: 'today', options: 'periodos', onChange: 'cargarGruposYEspacios' },
    { name: 'semestre', label: 'ptd.select_semestre_academico', icon: 'blur_linear', options: 'semestres', onChange: 'cargarGruposYEspacios' },
    { name: 'grupo', label: 'gestion_horarios.grupo', icon: 'group', options: 'grupos', onChange: '' },
    { name: 'espacioacademico', label: 'gestion_horarios.espacio_academico', icon: 'room', options: 'espaciosAcademicos', onChange: 'cargarInfoEspacioAcademico' }
];
