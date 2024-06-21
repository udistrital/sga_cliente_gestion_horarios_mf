import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { DisponibilidadCuposComponent } from './components/disponibilidad-cupos/disponibilidad-cupos.component';
import { HorarioPorGruposComponent } from './components/horario-por-grupos/horario-por-grupos.component';
import { GestionHorarioComponent } from './components/gestion-horario/gestion-horario.component';
import { CrearGrupoDialogComponent } from './components/gestion-horario/components/gestion-grupos/components/crear-grupo-dialog/crear-grupo-dialog.component';


const routes: Routes = [
  { path: "disponibilidad-cupos", component: DisponibilidadCuposComponent },
  { path: "por-grupos", component: HorarioPorGruposComponent },
  { path: "gestion", component: CrearGrupoDialogComponent },
  { path: "", component: DisponibilidadCuposComponent },
  { path: "**", component: DisponibilidadCuposComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ 
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/horarios/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch()) ]
})
export class AppRoutingModule { }