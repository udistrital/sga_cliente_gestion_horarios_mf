export const espaciosAcademicosContructorTabla = [
    { columnDef: 'espacio_academico', header: ('ptd.espacio_academico'), cell: (espacio: any) => espacio.espacioAcademico, sortable: true },
    { columnDef: 'grupo', header: ('gestion_horarios.grupo'), cell: (espacio: any) => espacio.grupo, sortable: true },
    { columnDef: 'horario', header: ('gestion_horarios.horario'), cell: (espacio: any) => espacio.horario, sortable: true },
    { columnDef: 'salon', header: ('ptd.espacio_fisico'), cell: (espacio: any) => espacio.salon, sortable: true },
    { columnDef: 'acciones', header: ('GLOBAL.seleccionar'), cell: (espacio: any) => '', sortable: false },
];

export const selectsCopiadoHorario = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'periodo', label: 'ptd.select_periodo_academico', icon: 'today', options: 'periodos', onChange: 'verificarExistenciaHorario' },
    { name: 'semestre', label: 'ptd.select_semestre_academico', icon: 'blur_linear', options: 'semestresDePlanEstudio', onChange: 'listarGruposEstudioSegunParametros' },
    { name: 'grupoEstudio', label: 'gestion_horarios.placeholder_grupo_copiar', icon: 'supervisor_account', options: 'gruposEstudio', onChange: '' },
];