export const espaciosAcademicosContructorTabla = [
    { columnDef: 'espacio_academico', header: ('ptd.espacio_academico'), cell: (espacio: any) => espacio.espacioAcademico, sortable: true },
    { columnDef: 'grupo', header: ('gestion_horarios.grupo'), cell: (espacio: any) => espacio.grupo, sortable: true },
    { columnDef: 'horario', header: ('gestion_horarios.horario'), cell: (espacio: any) => espacio.horario, sortable: true },
    { columnDef: 'salon', header: ('ptd.espacio_fisico'), cell: (espacio: any) => espacio.salon, sortable: true },
    { columnDef: 'acciones', header: ('GLOBAL.seleccionar'), cell: (espacio: any) => '', sortable: false },
];