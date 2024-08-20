export interface CardDetalleCarga {
    id: number|null;
    nombre: string;
    espacioAcademicoId: string|null;
    idActividad?: string|null;
    horas: number;
    dia?: string
    horaFormato: string|null;
    sede: any,
    edificio: any,
    salon: any,
    proyecto: any|null
    tipo: number|null;
    estado: number|null;
    bloqueado: boolean;
    dragPosition: CoordXY;
    prevPosition: CoordXY;
    finalPosition: CoordXY;
    modular?: boolean;
    docente_id?: string;
    docenteName?: string;
    cargaPlanId?: string;
}

export interface CoordXY {
    x: number;
    y: number;
}