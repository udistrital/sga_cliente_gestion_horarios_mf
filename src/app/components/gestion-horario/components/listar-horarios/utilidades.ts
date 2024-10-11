export const selectsParaConsulta = [
  // name: formControlName --- options: lista con la que se llena el select
  //--- onChange: metodo que ejecuta cuando hay cambio del select
  {
    name: 'semestre',
    label: 'ptd.select_semestre_academico',
    icon: 'blur_linear',
    options: 'semestresDePlanEstudio',
    onChange: 'listarGruposEstudioSegunParametros',
  },
  {
    name: 'grupoEstudio',
    label: 'gestion_horarios.placeholder_grupo',
    icon: 'supervisor_account',
    options: 'gruposEstudio',
    onChange: 'cargarEspaciosDeGrupoEstudio',
  },
  {
    name: 'espacioAcademico',
    label: 'gestion_horarios.select_espacio',
    icon: 'book',
    options: 'espaciosAcademicosDeGrupoEstudio',
    onChange: '',
  },
  {
    name: 'docente',
    label: 'ptd.nombre_docente',
    icon: 'account_circle',
    options: '',
    onChange: '',
  },
];
