export const gruposEstudioContructorTabla = [
    { columnDef: 'codigo', header:'gestion_horarios.codigo_grupo', cell: (grupoEstudio: any) => grupoEstudio.Codigo },
    { columnDef: 'capacidad', header:'gestion_horarios.capacidad', cell: (grupoEstudio: any) => grupoEstudio.Capacidad },
    { columnDef: 'espacio_academico', header:'gestion_horarios.espacio_academico', cell: (grupoEstudio: any) => grupoEstudio.EspacioAcademico },
    { columnDef: 'acciones', header:'GLOBAL.acciones', cell: (aspirante: any) => '' },
  ]