export const espaciosAcademicosContructorTabla = [
  {
    columnDef: 'espacio_academico',
    header: 'ptd.espacio_academico',
    cell: (espacio: any) =>
      espacio.espacioAcademico.nombre + ' - ' + espacio.grupo,
  },
  {
    columnDef: 'horario',
    header: 'gestion_horarios.horario',
    cell: (espacio: any) => espacio.horario,
  },
  {
    columnDef: 'salon',
    header: 'ptd.espacio_fisico',
    cell: (espacio: any) => espacio.salon,
  },
  {
    columnDef: 'conflictos',
    header: 'gestion_horarios.sin_conflictos',
    cell: (espacio: any) => '',
  },
  {
    columnDef: 'ver_conflictos',
    header: 'gestion_horarios.ver_conflictos',
    cell: (espacio: any) => '',
  },
];
