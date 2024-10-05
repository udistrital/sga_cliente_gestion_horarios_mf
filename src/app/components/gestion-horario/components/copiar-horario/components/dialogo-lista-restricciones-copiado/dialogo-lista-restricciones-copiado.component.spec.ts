import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoListaRestriccionesCopiadoComponent } from './dialogo-lista-restricciones-copiado.component';

describe('DialogoListaRestriccionesCopiadoComponent', () => {
  let component: DialogoListaRestriccionesCopiadoComponent;
  let fixture: ComponentFixture<DialogoListaRestriccionesCopiadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoListaRestriccionesCopiadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogoListaRestriccionesCopiadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
