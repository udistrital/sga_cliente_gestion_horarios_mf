import { FormGroup, AbstractControl } from '@angular/forms';

interface SelectControl extends AbstractControl {
  options?: any[]; // options es la referencia en utilidades
}

/**
 * Establece un comportamiento secuencial en un grupo de controles select dentro de un formulario.
 * Los controles serán habilitados o deshabilitados en función de la selección realizada en el control anterior.
 *
 * @param {FormGroup} form - El formulario que contiene los controles select.
 * @param {string[]} [sequentialControls] - Opcional. Un array con los nombres de los controles que deben ser secuenciales.
 * Si no se proporciona, todos los controles en el formulario serán tratados como secuenciales.
 *
 * @example
 * const form = this.fb.group({
 *   select1: [''],
 *   select2: [''],
 *   select3: ['']
 * });
 * 
 * // Hacer secuenciales solo select1 y select2
 * establecerSelectsSecuenciales(form, ['select1', 'select2']);
 * 
 * // Hacer secuenciales todos los selects
 * establecerSelectsSecuenciales(form);
 *
 * @returns {void}
 */
export function establecerSelectsSecuenciales(form: FormGroup, sequentialControls?: string[]): void {
  const controls = sequentialControls || Object.keys(form.controls);

  // Deshabilita todos los controles excepto el primero inicialmente
  controls.forEach((controlName, index) => {
    const control: AbstractControl | null = form.get(controlName);
    if (index > 0) {
      control?.disable(); // Deshabilita los controles excepto el primero inicialmente
    }

    // Suscribirse a cambios en el control anterior
    if (index > 0) {
      const previousControlName = controls[index - 1];
      form.get(previousControlName)?.valueChanges.subscribe(value => {
        // Habilita o deshabilita el control actual
        if (value) {
          control?.enable();
        } else {
          control?.disable();
        }

        for (let i = index; i < controls.length; i++) {
          const subsequentControl = form.get(controls[i]) as SelectControl;
          if (subsequentControl) {
            subsequentControl.setValue(''); // Asegura que esta opción esté seleccionada
          }
        }
      });
    }
  });
}

/**
 * Reinicia todos los controles de un formulario, estableciendo sus valores a una cadena vacía.
 *
 * @param {FormGroup} form - El formulario que contiene los controles a reiniciar.
 *
 * @returns {void}
 */
export function reiniciarFormulario(form: FormGroup): void {
  const controls = Object.keys(form.controls);
  controls.forEach(controlName => {
    const control = form.get(controlName);

    if (control) {
      control.setValue('');
    }
  });
}

export function limpiarErroresDeFormulario(form: any) {
  form.markAsPristine();
  form.markAsUntouched();
  Object.values(form.controls).forEach((control: any) => {
    control.setErrors(null);
  });
}