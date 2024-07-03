import { Injectable } from '@angular/core';
import { ProyectoAcademicoService } from "../app/services/proyecto_academico.service";
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ParametrosService } from '../app/services/parametros.service';
import { ordenarPorPropiedad } from './listas';
import { PlanesEstudioService } from '../app/services/plan-estudio.service';
import { PopUpManager } from '../app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { EspacioAcademicoService } from '../app/services/espacio-academico.service';

@Injectable({
  providedIn: 'root'
})
export class Parametros {
  constructor(
    private espacioAcademicoService: EspacioAcademicoService,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private planesEstudioService: PlanesEstudioService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  niveles(): Observable<any[]> {
    return this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').pipe(
      map((res: any) => {
        if (res.length === 0) {
          return
        }
        return res.filter((nivel: any) => nivel.NivelFormacionPadreId == undefined);
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  subnivelesSegunNivel(nivel: any): Observable<any[]> {
    return this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').pipe(
      map((res: any) => {
        if (res.length === 0) {
          return
        }
        return res.filter((subnivel: any) => {
          return subnivel.NivelFormacionPadreId && subnivel.NivelFormacionPadreId.Id == nivel.Id;
        });
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  proyectosSegunSubnivel(subnivel: any): Observable<any[]> {
    return this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').pipe(
      map((res: any) => {
        if (res.length === 0) {
          return
        }
        return res.filter((proyecto: any) => {
          return proyecto.NivelFormacionId && proyecto.NivelFormacionId.Id == subnivel.Id;
        })
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  periodos(): Observable<any[]> {
    return this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').pipe(
      map((res: any) => {
        if (res.length === 0) {
          return [];
        }
        return ordenarPorPropiedad(res.Data, "Nombre", -1)
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  planesEstudioSegunProyectoCurricular(proyecto: any): Observable<any[]> {
    const idProyecto = proyecto.Id
    return this.planesEstudioService.get('plan_estudio?query=ProyectoAcademicoId:' + idProyecto + '&limit=0').pipe(
      map((res: any) => {
        if (res.Data[0].Id === undefined) {
          this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_planes_de_proyecto"))
          return []
        }
        return ordenarPorPropiedad(res.Data, "Nombre", 1)
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  semestresSegunPlanEstudio(planEstudio: any): Observable<any[]> {
    let numeroSemestres = 0
    let semestresPlanEstudio:any;

    if (planEstudio.EspaciosSemestreDistribucion != "") {
      semestresPlanEstudio = JSON.parse(planEstudio.EspaciosSemestreDistribucion)
      numeroSemestres = Object.keys(semestresPlanEstudio).length;
    }else{
      this.popUpManager.showAlert("", this.translate.instant("gestion_horarios.no_semestres_para_plan_estudio"))
    }

    return this.parametrosService.get('parametro?query=TipoParametroId.Id:107&limit=0').pipe(
      map((res: any) => {
        if (res.length === 0) {
          return []
        }

        return ordenarPorPropiedad(res.Data.filter((semestre: any) => semestre.NumeroOrden <= numeroSemestres), "NumeroOrden", 1)
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  obtenerMateriasSegunPlanYSemestre(planEstudio:any, semestre:any): Observable<any[]> {
    const semestreNumero = semestre;
    const semestreClave = `semestre_${semestreNumero}`;
    const espaciosDistribucion = JSON.parse(planEstudio.EspaciosSemestreDistribucion);

    if (espaciosDistribucion.hasOwnProperty(semestreClave)) {
      const idEspaciosAcademicos = espaciosDistribucion[semestreClave].espacios_academicos;

      // Mapear los IDs de los espacios académicos
      const requests: Observable<any>[] = idEspaciosAcademicos.map((item: any, index: number) => {
        const espacio = item[`espacio_${index + 1}`];
        if (espacio.Id) {
          return this.espacioAcademicoService.get("espacio-academico/" + espacio.Id).pipe(
            map((res: any) => res.Data)
          );
        }
        return null;
      }).filter(Boolean) as Observable<any>[]; // Filtrar elementos nulos y convertir a Observable<any>[]

      // Combinar todas las solicitudes en paralelo usando forkJoin
      return forkJoin(requests);
    } else {
      return new Observable<any[]>((observer) => {
        observer.next([]);
        observer.complete(); // Si no hay espacios académicos, emitir un arreglo vacío
      });
    }
  }
}
