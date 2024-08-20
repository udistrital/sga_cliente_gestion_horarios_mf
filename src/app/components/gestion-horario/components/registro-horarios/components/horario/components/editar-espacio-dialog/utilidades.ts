export const selects = [
    // name: formControlName --- options: lista con la que se llena el select --- onChange: metodo que ejecuta cuando hay cambio del select
    { name: 'facultad', label: 'gestion_horarios.select_facultad', icon: 'location_city', options: 'facultades', onChange: 'cargarBloquesSegunFacultad' },
    { name: 'bloque', label: 'gestion_horarios.select_bloque', icon: 'domain', options: 'bloques', onChange: 'cargarSalonesSegunBloque' },
    { name: 'salon', label: 'gestion_horarios.select_salon', icon: 'collections_bookmark', options: 'salones', onChange: '' },
];