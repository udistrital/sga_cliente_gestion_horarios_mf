import { Injectable } from '@angular/core';
import { ProyectoAcademicoService } from "../app/services/proyecto_academico.service";
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ParametrosService } from '../app/services/parametros.service';
import { ordenarPorPropiedad } from './listas';
import { PlanesEstudioService } from '../app/services/planes-estudios.service';
import { PopUpManager } from '../app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class Parametros {
  constructor(
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
        console.error('Error loading niveles:', error);
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
        console.error('Error loading niveles:', error);
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
        console.error('Error loading niveles:', error);
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
        console.error('Error loading niveles:', error);
        return of([]);
      })
    );
  }
  
  planesEstudioSegunProyectoCurricular(proyecto:any): Observable<any[]> {
    const idProyecto = proyecto.Id
    return this.planesEstudioService.get('plan_estudio?query=ProyectoAcademicoId:'+ idProyecto +'&limit=0').pipe(
      map((res: any) => {
        console.log(res.Data)
        if (res.Data[0].Id === undefined) {
          this.popUpManager.showInfoToast(this.translate.instant("gestion_horarios.no_planes_de_proyecto"), 5000)
          return []
        }
        return ordenarPorPropiedad(res.Data, "Nombre", 1)
      }),
      catchError(error => {
        console.error('Error loading niveles:', error);
        return of([]);
      })
    );
  }
  
  semestresSegunPlanEstudio(planEstudio:any): Observable<any[]> {
    const semestresPlanEstudio = planEstudio.NumeroSemestres
    return this.parametrosService.get('parametro?query=TipoParametroId.Id:107&limit=0').pipe(
      map((res: any) => {
        if (res.length === 0) {
          return []
        }
         return ordenarPorPropiedad(res.Data.filter((semestre:any)=> semestre.NumeroOrden <= semestresPlanEstudio), "NumeroOrden", 1)
      }),
      catchError(error => {
        console.error('Error loading niveles:', error);
        return of([]);
      })
    );
  }
}
