import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HorarioService } from './horario.service';
import { PopUpManager } from '../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { EspacioAcademicoService } from './espacio-academico.service';
import { TercerosService } from './terceros.service';

@Injectable({
  providedIn: 'root',
})
export class GestionDocenteService {
  constructor(
    private espacioAcademicoService: EspacioAcademicoService,
    private terceroService: TercerosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  obtenerDocentesDeEspacioAcademico(espacioAcademico: any): Observable<any[]> {
    const espacioAcademicoId = espacioAcademico._id;

    return this.espacioAcademicoService
      .get(`espacio-academico/${espacioAcademicoId}`)
      .pipe(
        map((res: any) => res?.Data),
        switchMap((espacioAcademico: any) => {
          const docentesIds: any[] = [];

          if (espacioAcademico.espacio_modular) {
            docentesIds.push(
              ...(espacioAcademico?.lista_modular_docentes || [])
            );
          } else {
            docentesIds.push(espacioAcademico?.docente_id);
          }

          if (docentesIds.length === 0) {
            this.popUpManager.showAlert(
              '',
              this.translate.instant(
                'gestion_horarios.no_hay_docentes_asignados_espacio'
              )
            );
            return of([]);
          }

          const docentesObservables = docentesIds.map((docenteId: any) =>
            this.terceroService.get(`tercero/${docenteId}`).pipe(
              map((res: any) => {
                const nombreTransformado =
                  res.NombreCompleto.toLowerCase().replace(
                    /(?:^|\s|["'([{¿¡\-])\S/g,
                    (l: string) => l.toUpperCase()
                  );

                return {
                  Id: res.Id,
                  Nombre: nombreTransformado,
                };
              })
            )
          );
          return forkJoin(docentesObservables);
        })
      );
  }
}
