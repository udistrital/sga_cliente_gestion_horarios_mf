import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarGrupoDialogComponent } from './editar-grupo-dialog.component';

describe('EditarGrupoDialogComponent', () => {
  let component: EditarGrupoDialogComponent;
  let fixture: ComponentFixture<EditarGrupoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarGrupoDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarGrupoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
