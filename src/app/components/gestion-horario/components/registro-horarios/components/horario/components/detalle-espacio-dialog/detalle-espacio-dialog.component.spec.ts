import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleEspacioDialogComponent } from './detalle-espacio-dialog.component';

describe('DetalleEspacioDialogComponent', () => {
  let component: DetalleEspacioDialogComponent;
  let fixture: ComponentFixture<DetalleEspacioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleEspacioDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleEspacioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
