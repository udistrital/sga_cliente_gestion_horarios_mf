import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearGrupoDialogComponent } from './crear-grupo-dialog.component';

describe('CrearGrupoDialogComponent', () => {
  let component: CrearGrupoDialogComponent;
  let fixture: ComponentFixture<CrearGrupoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearGrupoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearGrupoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
