export const gruposEstudioContructorTabla = [
    { columnDef: 'codigo', header:'gestion_horarios.codigo_grupo', cell: (grupoEstudio: any) => grupoEstudio.CodigoProyecto +" "+ grupoEstudio.IndicadorGrupo },
    { columnDef: 'capacidad', header:'gestion_horarios.capacidad', cell: (grupoEstudio: any) => grupoEstudio.CuposGrupos },
    { columnDef: 'espacio_academico', header:'gestion_horarios.espacio_academico', cell: (grupoEstudio: any) => {
      if (grupoEstudio.EspaciosAcademicosCompletos && grupoEstudio.EspaciosAcademicosCompletos.length > 0) {
          return grupoEstudio.EspaciosAcademicosCompletos.map((espacio: any) => espacio.nombre + ' (' + espacio.grupo + ')').join(', ');
      }
      return '';
  }},
    { columnDef: 'acciones', header:'GLOBAL.acciones', cell: (aspirante: any) => '' },
  ]