export const selectsPasoUno = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'periodo', label: 'ptd.select_periodo_academico', icon: 'today', options: 'periodos', onChange: '' },
    { name: 'grupo', label: 'gestion_horarios.placeholder_grupo', icon: 'supervisor_account', options: 'grupos', onChange: '' },
];

export const selectsPasoDos_1 = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'espacio', label: 'gestion_horarios.select_espacio', icon: 'book', options: 'periodos', onChange: '' },
    { name: 'grupo', label: 'gestion_horarios.select_espacio_2', icon: 'dns', options: 'grupos', onChange: '' },
];

export const selectsPasoDos_2 = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'facultad', label: 'gestion_horarios.select_facultad', icon: 'location_city', options: 'periodos', onChange: '' },
    { name: 'bloque', label: 'gestion_horarios.select_bloque', icon: 'domain', options: 'grupos', onChange: '' },
    { name: 'salon', label: 'gestion_horarios.select_salon', icon: 'collections_bookmark', options: 'grupos', onChange: '' },
];