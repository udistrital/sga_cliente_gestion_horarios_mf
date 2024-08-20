export const gruposEstudioContructorTabla = [
    { columnDef: 'codigo', header:'gestion_horarios.codigo_grupo', cell: (grupoEstudio: any) => grupoEstudio.Nombre },
    { columnDef: 'capacidad', header:'gestion_horarios.capacidad', cell: (grupoEstudio: any) => grupoEstudio.CuposGrupos },
    { columnDef: 'espacio_academico', header:'gestion_horarios.espacio_academico', cell: (grupoEstudio: any) => {
      if (grupoEstudio.EspaciosAcademicos && grupoEstudio.EspaciosAcademicos.length > 0) {
          return grupoEstudio.EspaciosAcademicos.map((espacio: any) => espacio.nombre + ' (' + espacio.grupo + ')').join(', ');
      }
      return '';
  }},
    { columnDef: 'acciones', header:'GLOBAL.acciones', cell: (aspirante: any) => '' },
  ]
