import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { DisponibilidadCuposComponent } from './components/disponibilidad-cupos/disponibilidad-cupos.component';
import { HorarioPorGruposComponent } from './components/horario-por-grupos/horario-por-grupos.component';
import { GestionHorarioComponent } from './components/gestion-horario/gestion-horario.component';
import { AuthGuard } from '../_guards/auth.guard';


const routes: Routes = [
  {
    path: "disponibilidad-cupos",
    canActivate: [AuthGuard],
    component: DisponibilidadCuposComponent
  },
  { path: "por-grupos",
    canActivate: [AuthGuard] , 
    component: HorarioPorGruposComponent },
  { path: "gestion",
    canActivate: [AuthGuard] , 
    component: GestionHorarioComponent },
  { path: "",
    canActivate: [AuthGuard] , 
    component: DisponibilidadCuposComponent },
  { path: "**",
    canActivate: [AuthGuard] , 
    component: DisponibilidadCuposComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/horarios/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch())]
})
export class AppRoutingModule { }