export const espaciosDesactivosContructorTabla = [
  {
    columnDef: 'grupo',
    header: 'gestion_horarios.grupo',
    cell: (espacio: any) => espacio.nombre + ' (' + espacio.grupo + ')',
  },
  {
    columnDef: 'acciones',
    header: 'gestion_horarios.activar_desactivar',
    cell: (espacio: any) => '',
  },
];
