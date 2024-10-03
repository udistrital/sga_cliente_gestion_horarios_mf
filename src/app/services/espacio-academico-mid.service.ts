import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from './../../environments/environment';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
  headers: new HttpHeaders({
    Accept: 'application/json',
  }),
};

const httpOptionsFile = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data',
  }),
};

const path = environment.SGA_ESPACIOS_ACADEMICOS_MID_SERVICE;

@Injectable({
  providedIn: 'root',
})
export class EspacioAcademicoMidService {
  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('SGA_ESPACIOS_ACADEMICOS_MID_SERVICE');
  }

  get(endpoint: any) {
    this.requestManager.setPath('SGA_ESPACIOS_ACADEMICOS_MID_SERVICE');
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_ESPACIOS_ACADEMICOS_MID_SERVICE');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any) {
    this.requestManager.setPath('SGA_ESPACIOS_ACADEMICOS_MID_SERVICE');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: any, elementId: any) {
    this.requestManager.setPath('SGA_ESPACIOS_ACADEMICOS_MID_SERVICE');
    return this.requestManager.delete(endpoint, elementId);
  }
}
