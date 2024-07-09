import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { selects } from './utilidades';
import { PlanTrabajoDocenteMidService } from '../../../../../../../../services/plan-trabajo-docente-mid.service';

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
    public dialogRef: MatDialogRef<EditarEspacioDialogComponent>,
  ) {
   }

  ngOnInit(): void {
    console.log(this.infoEspacio)
    this.iniciarFormEspacio()
    this.cargarFacultades()
  }

  iniciarFormEspacio() {
    this.formEspacio = this._formBuilder.group({
      facultad: ['', Validators.required],
      bloque: ['', Validators.required],
      salon: ['', Validators.required],
      horas: ['', [Validators.required, Validators.min(0.5), Validators.max(8)]]
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
    const espacioEditado = { 
      ...this.formEspacio.value,
      id: this.infoEspacio.id
     };
    this.dialogRef.close(espacioEditado);
  }
}