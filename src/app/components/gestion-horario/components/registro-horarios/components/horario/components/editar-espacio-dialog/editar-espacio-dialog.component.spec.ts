import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEspacioDialogComponent } from './editar-espacio-dialog.component';

describe('EditarEspacioDialogComponent', () => {
  let component: EditarEspacioDialogComponent;
  let fixture: ComponentFixture<EditarEspacioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEspacioDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarEspacioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
