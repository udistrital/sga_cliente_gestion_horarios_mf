import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app.component';
import { DisponibilidadCuposComponent } from './components/disponibilidad-cupos/disponibilidad-cupos.component';
import { HorarioPorGruposComponent } from './components/horario-por-grupos/horario-por-grupos.component';
import { GestionHorarioComponent } from './components/gestion-horario/gestion-horario.component';


const routes: Routes = [
  { path: "disponibilidad-cupos", component: DisponibilidadCuposComponent },
  { path: "horario-por-grupos", component: HorarioPorGruposComponent },
  { path: "gestion-horario", component: GestionHorarioComponent },
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