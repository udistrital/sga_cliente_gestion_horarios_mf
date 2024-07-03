import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort'
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatTabsModule} from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { DisponibilidadCuposComponent } from './components/disponibilidad-cupos/disponibilidad-cupos.component';
import { HorarioPorGruposComponent } from './components/horario-por-grupos/horario-por-grupos.component';
import { GestionHorarioComponent } from './components/gestion-horario/gestion-horario.component';
import { GestionGruposComponent } from './components/gestion-horario/components/gestion-grupos/gestion-grupos.component';
import { RegistroHorariosComponent } from './components/gestion-horario/components/registro-horarios/registro-horarios.component';
import { ProyectoAcademicoService } from './services/proyecto_academico.service';
import { ParametrosService } from './services/parametros.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ListarHorariosComponent } from './components/gestion-horario/components/listar-horarios/listar-horarios.component';
import { CopiarHorarioComponent } from './components/gestion-horario/components/copiar-horario/copiar-horario.component';
import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';
import { CrearGrupoDialogComponent } from './components/gestion-horario/components/gestion-grupos/components/crear-grupo-dialog/crear-grupo-dialog.component';
import { EditarGrupoDialogComponent } from './components/gestion-horario/components/gestion-grupos/components/editar-grupo-dialog/editar-grupo-dialog.component';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl+'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DisponibilidadCuposComponent,
    HorarioPorGruposComponent,
    GestionHorarioComponent,
    GestionGruposComponent,
    RegistroHorariosComponent,
    ListarHorariosComponent,
    CopiarHorarioComponent,
    CrearGrupoDialogComponent,
    EditarGrupoDialogComponent
  ],
  imports: [
    MatTabsModule,
    MatChipsModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    BrowserModule,
    MatRadioModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MatTableModule, 
    MatPaginatorModule,
    MatDialogModule,
    MatStepperModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DragDropModule,
    SpinnerUtilModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    HttpClientModule,
    StoreModule.forRoot({}, {})
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerUtilInterceptor, multi: true },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    ProyectoAcademicoService,
    ParametrosService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }