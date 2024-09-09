import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoVerEspaciosDesactivosComponent } from './dialogo-ver-espacios-desactivos.component';

describe('DialogoVerEspaciosDesactivosComponent', () => {
  let component: DialogoVerEspaciosDesactivosComponent;
  let fixture: ComponentFixture<DialogoVerEspaciosDesactivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogoVerEspaciosDesactivosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogoVerEspaciosDesactivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
