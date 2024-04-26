import { Validators } from '@angular/forms';

export let FORM_DISPONIBILIDAD_CUPOS = {
    campos_p1: [
        {
            etiqueta: 'select',
            claseGrid: 'form-col1',
            nombre: 'nivel',
            label_i18n: 'GLOBAL.nivel',
            placeholder_i18n: 'GLOBAL.placeholder_nivel',
            requerido: true,
            validacion: [Validators.required],
            tipo: 'text',
            opciones: [],
            entrelazado: true, 
        },
        {
            etiqueta: 'select',
            claseGrid: 'form-col1',
            nombre: 'subnivel',
            label_i18n: 'GLOBAL.subnivel',
            placeholder_i18n: 'GLOBAL.placeholder_subnivel',
            requerido: true,
            validacion: [Validators.required],
            tipo: 'text',
            opciones: [],
            entrelazado: true,
        },
        {
            etiqueta: 'select',
            claseGrid: 'form-col1',
            nombre: 'proyectoCurricular',
            label_i18n: 'GLOBAL.proyecto_academico',
            placeholder_i18n: 'GLOBAL.placeholder_proyecto_curricular',
            requerido: true,
            validacion: [Validators.required],
            tipo: 'text',
            opciones: [],
        },
        {
            etiqueta: 'select',
            claseGrid: 'form-col1',
            nombre: 'periodos',
            label_i18n: 'gestion_horarios.periodo_academico',
            placeholder_i18n: 'GLOBAL.placeholder_proyecto_curricular',
            requerido: true,
            validacion: [Validators.required],
            tipo: 'text',
            opciones: [],
        }
        ,
        {
            etiqueta: 'select',
            claseGrid: 'form-col1',
            nombre: 'Semestre',
            label_i18n: 'gestion_horarios.semestre',
            placeholder_i18n: 'GLOBAL.placeholder_proyecto_curricular',
            requerido: true,
            validacion: [Validators.required],
            tipo: 'text',
            opciones: [],
        }
    ],
}