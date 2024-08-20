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

  /**
 * Gestiona la existencia de horario, si no existe, crea uno
 * 
 * @param {any} proyecto - Objeto que representa el proyecto académico. 
 * @param {any} planEstudio - Objeto que representa el plan de estudios asociado al proyecto. 
 * @param {any} periodo - Objeto que representa el periodo académico. 
 * @param {any[]} semestres - Arreglo que contiene los semestres del plan de estudio. 
 * @param {Function} callback - Función que se ejecutará después de gestionar el horario.
 */
  gestionarHorario(proyecto: any, planEstudio: any, periodo: any, semestres: any[], callback: Function) {
    this.consultarExistenciaDeHorario(proyecto, planEstudio, periodo).subscribe((res: any) => {
      if (res.Success && res.Data.length > 0) {
        callback(res.Data[0]);
      } else {
        this.popUpManager.showConfirmAlert(
          this.translate.instant("gestion_horarios.desea_crear_horario_descripcion") + periodo.Nombre,
          this.translate.instant("gestion_horarios.desea_crear_horario")
        ).then((confirmado: any) => {
          if (confirmado.value) {
            this.construirObjetoHorario(proyecto, planEstudio, periodo, semestres).subscribe((horario) => {
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

  consultarExistenciaDeHorario(proyecto: any, planEstudio: any, periodo: any): Observable<any> {
    const proyectoId = proyecto.Id;
    const planId = planEstudio.Id;
    const periodoId = periodo.Id;

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

  construirObjetoHorario(proyecto: any, planEstudio: any, periodo: any, semestres: any[]): Observable<any> {
    const nombreHorario = `Horario de ${proyecto.Nombre} del plan: ${planEstudio.Nombre} periodo ${periodo.Nombre}`;
    const codigoAbreviacion = `Horario-${proyecto.Nombre}-${planEstudio.Nombre}-${periodo.Nombre}`;

    return this.horarioService.get("estado-creacion?query=Nombre:Aprobado&fields=_id").pipe(
      map((res: any) => {
        const estadoCreacionId = res.Data[0]._id;
        return {
          Nombre: nombreHorario,
          CodigoAbreviacion: codigoAbreviacion,
          Codigo: "Vacio",
          ProyectoAcademicoId: proyecto.Id,
          PlanEstudioId: planEstudio.Id,
          Semestres: semestres.length,
          PeriodoId: periodo.Id,
          EstadoCreacionId: estadoCreacionId,
          Observacion: "Vacio",
          Activo: true,
        };
      })
    );
  }
}
