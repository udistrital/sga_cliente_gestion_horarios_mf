import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HorarioService } from './horario.service';
import { PopUpManager } from '../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class GestionExistenciaHorarioService {
  constructor(
    private horarioService: HorarioService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {}

  gestionarHorario(dataParametrica: any, semestres: any[], callback: Function) {
    this.consultarExistenciaDeHorario(dataParametrica).subscribe((res: any) => {
      if (res.Success && res.Data.length > 0) {
        callback(res.Data[0]);
      } else {
        this.popUpManager.showConfirmAlert(
          this.translate.instant("gestion_horarios.desea_crear_horario_descripcion") + dataParametrica.periodo.Nombre,
          this.translate.instant("gestion_horarios.desea_crear_horario")
        ).then((confirmado: any) => {
          if (confirmado.value) {
            this.construirObjetoHorario(dataParametrica, semestres).subscribe((horario) => {
              this.guardarHorario(horario).subscribe((res: any) => {
                if (res.Success) {
                  callback(res.Data);
                  this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.horario_creado_satisfactoriamente"));
                } else {
                  this.popUpManager.showAlert("", this.translate.instant("GLOBAL.error"));
                }
              });
            });
          } else {
            callback(null);
          }
        });
      }
    });
  }

  consultarExistenciaDeHorario(dataParametrica: any): Observable<any> {
    const proyectoId = dataParametrica.proyecto.Id;
    const planId = dataParametrica.planEstudio.Id;
    const periodoId = dataParametrica.periodo.Id;

    const query = `horario?query=ProyectoAcademicoId:${proyectoId},PlanEstudioId:${planId},PeriodoId:${periodoId},Activo:true`;
    return this.horarioService.get(query).pipe(
      map((res: any) => res)
    );
  }

  guardarHorario(horario: any): Observable<any> {
    return this.horarioService.post("horario", horario).pipe(
      map((res: any) => res)
    );
  }

  construirObjetoHorario(dataParametrica: any, semestres: any[]): Observable<any> {
    const nombreHorario = `Horario del ${dataParametrica.proyecto.Nombre} del plan ${dataParametrica.planEstudio.Nombre} periodo ${dataParametrica.periodo.Nombre}`;
    const codigoAbreviacion = `Horario-${dataParametrica.proyecto.Nombre}-${dataParametrica.planEstudio.Nombre}-${dataParametrica.periodo.Nombre}`;

    return this.horarioService.get("estado-creacion?query=Nombre:Aprobado&fields=_id").pipe(
      map((res: any) => {
        const estadoCreacionId = res.Data[0]._id;
        return {
          Nombre: nombreHorario,
          CodigoAbreviacion: codigoAbreviacion,
          Codigo: "Vacio",
          ProyectoAcademicoId: dataParametrica.proyecto.Id,
          PlanEstudioId: dataParametrica.planEstudio.Id,
          Semestres: semestres.length,
          PeriodoId: dataParametrica.periodo.Id,
          EstadoCreacionId: estadoCreacionId,
          Observacion: "Vacio",
          Activo: true,
        };
      })
    );
  }
}
