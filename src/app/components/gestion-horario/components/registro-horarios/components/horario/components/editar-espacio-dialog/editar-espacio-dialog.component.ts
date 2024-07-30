import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { selects } from './utilidades';
import { PlanTrabajoDocenteMidService } from '../../../../../../../../services/plan-trabajo-docente-mid.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'udistrital-editar-espacio-dialog',
  templateUrl: './editar-espacio-dialog.component.html',
  styleUrl: './editar-espacio-dialog.component.scss'
})
export class EditarEspacioDialogComponent {

  [key: string]: any; // Permitir el acceso dinámico con string keys

  informacionParaForm: any
  bloques: any
  facultades: any
  salones: any
  selects: any

  formEspacio!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public infoEspacio: any,
    private _formBuilder: FormBuilder,
    private planTrabajoDocenteMid: PlanTrabajoDocenteMidService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<EditarEspacioDialogComponent>,
  ) {
   }

  ngOnInit(): void {
    this.iniciarFormEspacio()
    this.cargarFacultades()
  }

  iniciarFormEspacio() {
    this.formEspacio = this._formBuilder.group({
      facultad: ['', Validators.required],
      bloque: ['', Validators.required],
      salon: ['', Validators.required],
      horas: ['', [
        Validators.required,
        this.horaValidador(this.infoEspacio.horaFormato)
      ]]
    });
    this.selects = selects
  }

  cargarDatosFormEspacio(){
    const facultad = this.facultades.find((facultad: any) => facultad.Id === this.infoEspacio.sede.Id);
      this.formEspacio.patchValue({
        facultad: facultad,
        horas: this.infoEspacio.horas
      })
      this.cargarBloquesSegunFacultad(facultad)
      const edificio = this.bloques.find((bloque:any) => bloque.Id === this.infoEspacio.edificio.Id)
      this.formEspacio.patchValue({
        bloque: edificio,
      })
      this.cargarSalonesSegunBloque(edificio)
      const salon = this.salones.find((salon:any) => salon.Id === this.infoEspacio.salon.Id)
      this.formEspacio.patchValue({
        salon: salon,
      })
  }

  cargarFacultades() {
    const dependenciaId = this.infoEspacio.proyecto.DependenciaId
    this.planTrabajoDocenteMid.get('espacio-fisico/dependencia?dependencia=' + dependenciaId).subscribe((res:any)=>{
      this.informacionParaForm = res.Data
      this.facultades = res.Data.Sedes
      this.limpiarSelectoresDependientes('facultad');
      this.cargarDatosFormEspacio()
    })
  }

  cargarBloquesSegunFacultad(sede: any) {
    const facultadId = sede.Id
    this.bloques = this.informacionParaForm.Edificios[facultadId];
    this.limpiarSelectoresDependientes('bloque');
  }

  cargarSalonesSegunBloque(edificio: any) {
    const edificioId = edificio.Id
    this.salones = this.informacionParaForm.Salones[edificioId];
  }

  limpiarSelectoresDependientes(selector: string) {
    //este metodo borra los valores seleccionados, si se cambia el select anterior
    const index = selects.findIndex(s => s.name === selector);
    for (let i = index + 1; i < selects.length; i++) {
      this[selects[i].options] = [];
    }
  }
  
  editarEspacio(){
    if (this.formEspacio.invalid) {
      this.formEspacio.markAllAsTouched();
      return;
    }

    const espacioEditado = { 
      ...this.formEspacio.value,
      id: this.infoEspacio.id
     };
    this.dialogRef.close(espacioEditado);
  }


  horaValidador(intervalo: string, maxHoraPermitida: number = 23): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const horas = control.value;
      const [horaInicio] = intervalo.split(' - ');
      const [horaInicioH, minutoInicioM] = horaInicio.split(':').map(Number);
      const horasRestantes = maxHoraPermitida - (horaInicioH + minutoInicioM / 60);
  
      if (horas < 0.5) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_min")};
      }
      
      if (horas > horasRestantes) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_max") + " " + horasRestantes };
      }

      if (horas > 8) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_max") + " 8" };
      }

      if (horas % 0.25 !== 0) {
        return { errorHora: this.translate.instant("gestion_horarios.cantidad_horas_multiplo_0.25")};
      }
  
  
  
      return null;
    };
  }
}