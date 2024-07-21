import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HorarioService } from './horario.service';

@Injectable({
  providedIn: 'root',
})
export class GestionExistenciaHorarioService {
  constructor(private horarioService: HorarioService) {}

  gestionarHorario(dataParametrica: any, semestres: any[], popUpManager: any, translate: any, callback: Function) {
    this.consultarExistenciaDeHorario(dataParametrica).subscribe((res: any) => {
      if (res.Success && res.Data.length > 0) {
        callback(res.Data[0]);
      } else {
        popUpManager.showConfirmAlert(
          translate.instant("gestion_horarios.desea_crear_horario_descripcion") + dataParametrica.periodo.Nombre,
          translate.instant("gestion_horarios.desea_crear_horario")
        ).then((confirmado: any) => {
          if (confirmado.value) {
            this.construirObjetoHorario(dataParametrica, semestres).subscribe((horario) => {
              this.guardarHorario(horario).subscribe((res: any) => {
                if (res.Success) {
                  callback(res.Data);
                  popUpManager.showAlert("", translate.instant("gestion_horarios.horario_creado_satisfactoriamente"));
                } else {
                  popUpManager.showAlert("", translate.instant("GLOBAL.error"));
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

  gestionarHorarioSemestre(horarioPadre: any, semestre: any, periodoId: any, popUpManager: any, translate: any, callback: Function) {
    this.consultarExistenciaDeHorarioSemestre(horarioPadre, semestre).subscribe((res: any) => {
      if (res.Success && res.Data.length > 0) {
        callback(res.Data[0]);
      } else {
        popUpManager.showConfirmAlert(
          translate.instant("gestion_horarios.desea_crear_horario_semestre_descripcion") + ": " + semestre.Nombre,
          translate.instant("gestion_horarios.desea_crear_horario_semestre")
        ).then((confirmado: any) => {
          if (confirmado.value) {
            this.construirObjetoHorarioSemestre(horarioPadre, semestre, periodoId).subscribe((horarioSemestre) => {
              this.guardarHorarioSemestre(horarioSemestre).subscribe((res: any) => {
                if (res.Success) {
                  callback(res.Data);
                  popUpManager.showAlert("", translate.instant("gestion_horarios.horario_creado_satisfactoriamente"));
                } else {
                  popUpManager.showAlert("", translate.instant("GLOBAL.error"));
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
    const periodo = dataParametrica.periodo;

    const query = `horario?query=ProyectoAcademicoId:${proyectoId},PlanEstudioId:${planId},PeriodoId:${periodo.Id},Activo:true`;
    return this.horarioService.get(query).pipe(
      map((res: any) => res)
    );
  }

  consultarExistenciaDeHorarioSemestre(horarioPadre: any, semestre: any): Observable<any> {
    const horarioId = horarioPadre._id;
    const query = `horario-semestre?query=HorarioId:${horarioId},SemestreId:${semestre.Id},Activo:true`;
    return this.horarioService.get(query).pipe(
      map((res: any) => res)
    );
  }

  guardarHorario(horario: any): Observable<any> {
    return this.horarioService.post("horario", horario).pipe(
      map((res: any) => res)
    );
  }

  guardarHorarioSemestre(horarioSemestre: any): Observable<any> {
    return this.horarioService.post("horario-semestre", horarioSemestre).pipe(
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

  construirObjetoHorarioSemestre(horarioPadre: any, semestre: any, periodoId: any): Observable<any> {
    const nombreHorario = `${horarioPadre.Nombre} ${semestre.Nombre}`;
    const codigoAbreviacion = `${horarioPadre.CodigoAbreviacion}-${semestre.Nombre}`;

    return this.horarioService.get("estado-creacion-semestre?query=Nombre:Aprobado&fields=_id").pipe(
      map((res: any) => {
        const estadoCreacionSemestreId = res.Data[0]._id;
        return {
          Nombre: nombreHorario,
          CodigoAbreviacion: codigoAbreviacion,
          SemestreId: semestre.Id,
          PeriodoId: periodoId,
          HorarioId: horarioPadre._id,
          EstadoCreacionSemestreId: estadoCreacionSemestreId,
          Observacion: "Vacio",
          Activo: true,
        };
      })
    );
  }
}
