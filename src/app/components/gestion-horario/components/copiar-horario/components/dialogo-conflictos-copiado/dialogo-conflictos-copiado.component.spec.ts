import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoConflictosCopiadoComponent } from './dialogo-conflictos-copiado.component';

describe('DialogoListaRestriccionesCopiadoComponent', () => {
  let component: DialogoConflictosCopiadoComponent;
  let fixture: ComponentFixture<DialogoConflictosCopiadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoConflictosCopiadoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogoConflictosCopiadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
