import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEspacioGrupoDialogComponent } from './crear-espacio-grupo-dialog.component';

describe('CrearEspacioGrupoDialogComponent', () => {
  let component: CrearEspacioGrupoDialogComponent;
  let fixture: ComponentFixture<CrearEspacioGrupoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEspacioGrupoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearEspacioGrupoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
