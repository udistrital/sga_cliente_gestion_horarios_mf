import { FormGroup, AbstractControl } from '@angular/forms';

interface SelectControl extends AbstractControl {
  options?: any[]; // options es la referencia en utilidades
}

export function establecerSelectsSecuenciales(form: FormGroup): void {
  const controls = Object.keys(form.controls);

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