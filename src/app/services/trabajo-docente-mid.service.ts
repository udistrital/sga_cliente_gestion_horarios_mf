import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root',
})

export class TrabajoDocenteMidService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('TRABAJO_DOCENTE_MID');
  }

  get(endpoint: any) {
    this.requestManager.setPath('TRABAJO_DOCENTE_MID');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any) {
    this.requestManager.setPath('TRABAJO_DOCENTE_MID');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any) {
    this.requestManager.setPath('TRABAJO_DOCENTE_MID');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: any, element: any) {
    this.requestManager.setPath('TRABAJO_DOCENTE_MID');
    return this.requestManager.delete(endpoint, element.Id);
  }
}