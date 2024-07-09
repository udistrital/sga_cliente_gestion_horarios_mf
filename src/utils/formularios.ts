export function limpiarErroresDeFormulario(form: any) {
    form.markAsPristine();
    form.markAsUntouched();
    Object.values(form.controls).forEach((control:any) => {
      control.setErrors(null);
    });
  }