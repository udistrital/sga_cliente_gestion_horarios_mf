import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaColocacionesComponent } from './lista-colocaciones.component';

describe('ListaColocacionesComponent', () => {
  let component: ListaColocacionesComponent;
  let fixture: ComponentFixture<ListaColocacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaColocacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaColocacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
